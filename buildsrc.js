#!/usr/bin/node
// 默认设置
// 本文件和LoaderCore一同发布
let genGid = name => `~:~:~:${name}:~`;
let targetFile = "manifest.json";
let sourceDir = process.cwd();

let args = process.argv.splice(2), sParsed = false, oParsed = false, gParsed = false;
while(args.length) {
	let cur = args.shift();
	switch(cur) {
		case "-s":
			if(!sParsed){
				sParsed = true;
				if(!(sourceDir = args.shift())) {
					console.error("无效的命令参数 -s");
					process.exit(1);
				}
			} else {
				console.error("重复设置 -s");
				process.exit(3);
			}
			break;
		case "-o":
			if(!oParsed){
				oParsed = true;
				if(!(targetFile = args.shift())) {
					console.error("无效的命令参数 -o");
					process.exit(1);
				}
			} else {
				console.error("重复设置 -o");
				process.exit(3);
			}
			break;
		case "-g":
			if(!gParsed){
				gParsed = true;
				let gidPattern = args.shift();
				if(!gidPattern) {
					console.error("无效的命令参数 -g");
					process.exit(1);
				}
				genGid = basename => gidPattern.replace(/%basename%/i, basename);
			} else {
				console.error("重复设置 -g");
				process.exit(3);
			}
			break;
		case "-h":
			console.log("本程序用于生成适用于MCBBS-Loader的软件源，和LoaderCore 1.1一同发行\n" +
					"参数：\n" + 
					"    -s <source>    指定源代码存放路径        例： -s .\n" + 
					"    -o <output>    指定输出json存放路径      例： -o manifest.json\n" +
					"    -g <gengid>    指定gid的格式             例： -g CaveNightingale:CaveNightingale-MCBBS-Modules:%basename%:master");
			process.exit(2);
		default:
			console.error("无效的命令参数 " + cur);
			process.exit(4);
	}
}

const fs = require("fs");
const path = require("path");
function parseMeta(code) {
	const map = {};
	const extractMetaRegex = /(?<=\/\*( )*MCBBS[ -]*Module)[\s\S]*?(?=\*\/)/;
	const metaarr = code.match(extractMetaRegex) || [];
	const metas = (metaarr[0] || "").replace(/\\\n/g, "");
	const allmeta = metas.split("\n");
	const isItemRegex = /.+?\=.*/;
	const kRegex = /.+?(?=\=)/;
	const vRegex = /(?<=\=).*/;
	for (const l of allmeta) {
		const line = l.trim();
		if (isItemRegex.test(line)) {
			const k = ((kRegex.exec(line) || [])[0] || "").trim();
			const v = ((vRegex.exec(line) || [])[0] || "").trim();
			if(k)
				map[k] = v;
		}
	}
	return map;
}
fs.readdir(sourceDir, (err, data) => {
	if(err) {
		console.error(err)
	} else{
		let success = 0, total = 0, jsons = [];
		const updateStatus = () => {
			if(success == total) {
				fs.writeFile(targetFile, `{\n${jsons.join(",\n")}\n}`, err => {
					if(err) {
						console.error(err);
					}
				});
			}
		}
		data.forEach(name => {
			if (name.match(/^[A-Z][A-Z|a-z|0-9]*\.js$/)) { // 所有模块以大驼峰命名
				total++;
				fs.readFile(path.join(sourceDir, name), (err, data) => {
					success++;
					if(err) {
						console.warn(err);
					} else {
						const context = data.toString();
						const module = parseMeta(context);
						if(module.id && module.version) {
							const innerJSON = [];
							for(const key of ["id", "name", "description", "author", "version", "icon", "apiVersion"])
								if(module[key])
									innerJSON.push(`\t\t"${key}": ${JSON.stringify(module[key])}`);
							innerJSON.push(`\t\t"gid": ${JSON.stringify(genGid(name.replace(/\.js$/, "")))}`);
							jsons.push(`\t${JSON.stringify(module.id)}: {\n${innerJSON.join(",\n")}\n\t}`);
						} else {
							console.warn(name + "不是一个模块");
						}
					}
					updateStatus();
				});
			}
		});
		updateStatus();
	}
});
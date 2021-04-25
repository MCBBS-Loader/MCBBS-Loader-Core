export function getUserDisplayName():string{
    const p = $("p.username");
    if(p.length===0){
        return ""
    }
    return p.html();
}
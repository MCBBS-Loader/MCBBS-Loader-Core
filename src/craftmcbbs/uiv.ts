export function uiVersion():2|3{
   if($(".btn_sqrt[href='/?new=no']").length>0){
       return 3
   }
   return 2
}
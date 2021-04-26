// TODO 发帖 API
export function isPostPage(): boolean {
    let pnBase = $("[class='ptm pnpost']")
    if (pnBase.length === 0) {
        return false
    }
    return pnBase.children("button[name='replysubmit']").length !== 0
}

export function whoPosted(): string {
    return String($("p.p-description > ul > li").first().children("a").attr("title"))
}


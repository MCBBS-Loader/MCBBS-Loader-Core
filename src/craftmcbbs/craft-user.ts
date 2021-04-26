export function getUserDisplayName(): string {
    const p = $("p.username");
    if (p.length === 0) {
        return "";
    }
    return p.html();
}

export function getUID(): string {
    let c = $("a#user_info > span.avatar");
    if (c.length === 0) {
        return "";
    }
    return String(c.data("user-id") || "");
}
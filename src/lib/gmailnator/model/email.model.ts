export type Message = {
    date: number,
    from: string,
    id: string,
    subject: string,
    content: string,
}

export type InboxParams = {
    email: string,
    limit?: number,
}

export type MessageParams = {
    id: string,
}
export class UserPayload {
    private id: number;
    private username: string;

    constructor(id: number, username: string) {
        this.id = id;
        this.username = username;
    }

    getPayload() {
        return Object.assign({}, this);
    }
}
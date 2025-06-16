"use strict";

const StatusCode = {
    OK: 200,
    CREATED: 201,
};

const ReasonStatusCode = {
    [StatusCode.OK]: "Success",
    [StatusCode.CREATED]: "Created",
};

class SuccessResponse {
    constructor(message, statusCode = StatusCode.OK, metadata = {}) {
        this.message = message || ReasonStatusCode[statusCode];
        this.status = statusCode;
        this.metadata = metadata;
    }

    send(res, headers = {}) {
        if (Object.keys(headers).length > 0) {
            res.set(headers);
        }
        return res.status(this.status).json(this);
    }

    static create(message, statusCode, metadata) {
        return new SuccessResponse(message, statusCode, metadata);
    }
}

class Ok extends SuccessResponse {
    constructor(message, metadata) {
        super(message, StatusCode.OK, metadata);
    }

    static create(message, metadata) {
        return new Ok(message, metadata);
    }
}

class Created extends SuccessResponse {
    constructor(message, metadata, options = {}) {
        super(message, StatusCode.CREATED, metadata);
        this.options = options;
    }

    static create(message, metadata, options) {
        return new Created(message, metadata, options);
    }
}

module.exports = {
    SuccessResponse,
    Ok,
    Created,
};
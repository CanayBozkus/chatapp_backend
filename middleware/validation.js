class Validation {
    constructor(body) {
        this.body = body
        this.bodyKeys = Object.keys(body)
    }

    missingValues = []

    email(paramName){
        if(!this.bodyKeys.includes(paramName)){
            this.missingValues.push(paramName)
        }
        return this
    }

    string(paramName){
        if(!this.bodyKeys.includes(paramName)){
            this.missingValues.push(paramName)
        }
        return this
    }

    array(paramName){
        if(!this.bodyKeys.includes(paramName)){
            this.missingValues.push(paramName)
        }
        return this
    }

    date(paramName){
        if(!this.bodyKeys.includes(paramName)){
            this.missingValues.push(paramName)
        }
        return this
    }

    validate(){
        if(this.missingValues.length){
            const errorMsg = this.missingValues.join(', ')
            const error = new Error(errorMsg)
            error.statusCode = 400
            throw error
        }
    }
}

module.exports =  (body) => {
    return new Validation(body)
}

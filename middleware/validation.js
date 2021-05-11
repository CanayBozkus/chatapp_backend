const Validation = {
    toBeCheckedFields: [],
    body: {},

    exec(){
        return (req, res, next) => {
            const missingFields = []
            for(let field of this.toBeCheckedFields){
                !Object.keys(req.body).includes(field) ?  missingFields.push(field) : null
            }

            if(missingFields.length){
                return res.json({
                    success: false,
                    message: 'Missing parameters: ' + missingFields.join(', ')
                })
            }
            next()
        }
    },
    email(paramName) {
        this.toBeCheckedFields.push(paramName)
        return this
    },
    string(paramName){
        this.toBeCheckedFields.push(paramName)
        return this
    },
    integer(paramName){
        this.toBeCheckedFields.push(paramName)
        return this
    },
    phoneNumber(paramName){
        this.toBeCheckedFields.push(paramName)
        return this
    },
    array(paramName){
        this.toBeCheckedFields.push(paramName)
        return this
    },
    dateTime(paramName){
        this.toBeCheckedFields.push(paramName)
        return this
    }

}

/*
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

 */

module.exports =  Validation

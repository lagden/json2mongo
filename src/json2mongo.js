import * as mongo from 'mongodb'

function json2mongo(obj) {
	for (const [key, val] of Object.entries(obj)) {
		let _base = Buffer.alloc(16, 0x00)

		switch (key) {
			case '$binary':
			case '$type':
				return new mongo.Binary(obj.$binary, obj.$type)
			case '$date':
				return new Date(val)
			case '$decimal128':
				_base.write(val)
				return new mongo.Decimal128(_base)
			case '$timestamp':
				return new mongo.Timestamp({t: val.t, i: val.i})
			case '$regex':
			case '$options':
				return new RegExp(obj.$regex, obj.$options)
			case '$oid':
				return new mongo.ObjectId(val)
			case '$ref':
			case '$id':
			case '$db': {
				const id = obj.$id._bsontype ? obj.$id : new mongo.ObjectId(obj.$id.$oid)
				return new mongo.DBRef(obj.$ref, id, obj.$db)
			}
			case '$undefined':
				return undefined
			case '$minKey':
				return new mongo.MinKey()
			case '$maxKey':
				return new mongo.MaxKey()
			case '$numberLong':
				if (typeof val === 'string') {
					return mongo.Long.fromString(val)
				} else {
					return mongo.Long.fromNumber(val)
				}
		}

		if (typeof val === 'object') {
			obj[key] = json2mongo(val)
		}
	}
	return obj
}

export default json2mongo

/* eslint-disable no-loss-of-precision */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable unicorn/better-regex */

import assert from 'node:assert'
import * as mongo from 'mongodb'
import json2mongo from '../src/json2mongo.js'

const _base = Buffer.alloc(16, 0x00)
_base.write('42.42')

const query = {
	_id: { $oid: '123456789012345678901234' },
	created: { $date: '2013-01-01T00:00:00.000Z' },
	decimal: { $decimal128: '42.42' },
	ts: { $timestamp: { t: 1_412_180_887, i: 1 } },
	fkey1: {
		$ref: 'creators',
		$id: { $oid: '123456789012345678901234' },
		$db: 'users',
	},
	fkey2: {
		$ref: 'creators',
		$id: {
			$oid: '123456789012345678901234',
		},
	},
	binary: { $binary: Buffer.from('foo') },
	minKey: { $minKey: 1 },
	maxKey: { $maxKey: 1 },
	numberLong: { $numberLong: '9223372036854775807' },
	numberLong2: { $numberLong: 9223372036854775807 },
	foo: { $undefined: true },
	bar: { $regex: '[0-9]' },
	baz: { $regex: '[a-z]', $options: 'i' },
	$and: [{ foo: { $undefined: true } }, { bar: { $undefined: true } }],
	bool: true,
	obj: { foo: 123 },
	string: 'foo',
}

const result = {
	_id: new mongo.ObjectId(query._id.$oid),
	created: new Date('2013-01-01T00:00:00.000Z'),
	decimal: new mongo.Decimal128(_base),
	ts: new mongo.Timestamp({ t: 1_412_180_887, i: 1 }),
	fkey1: new mongo.DBRef(
		query.fkey1.$ref,
		new mongo.ObjectId(query.fkey1.$id.$oid),
		query.fkey1.$db,
	),
	fkey2: new mongo.DBRef(
		query.fkey2.$ref,
		new mongo.ObjectId(query.fkey2.$id.$oid),
	),
	binary: new mongo.Binary(Buffer.from('foo')),
	minKey: new mongo.MinKey(),
	maxKey: new mongo.MaxKey(),
	numberLong: mongo.Long.MAX_VALUE,
	numberLong2: mongo.Long.MAX_VALUE,
	foo: undefined,
	bar: /[0-9]/,
	baz: /[a-z]/i,
	$and: [{ foo: undefined }, { bar: undefined }],
	bool: true,
	obj: { foo: 123 },
	string: 'foo',
}

assert.deepEqual(json2mongo(query), result)

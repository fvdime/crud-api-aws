const db = require('./db')
const { GetItemCommand, PutItemCommand, DeleteItemCommand, ScanCommand, UpdateItemCommand} = require("@aws-sdk/client-dynamodb")
const {marshall, unmarshall} = require("@aws-sdk/util-dynamodb")

const getPost = async (event) => {
  const response = { status: 200 }

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.PostId })
    }

    const { Item } = await db.send(new GetItemCommand(params))

    console.log({Item})

    response.body = JSON.stringify({
      message: "Successfully fetched!",
      data: (Item) ? unmarshall(Item) : {},
      rawData: Item,
    })
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: "Failed to fetch!",
      errorMessage: error.message,
      errorStack: error.stack,
    })
  }

  return response
}

const createPost = async (event) => {
  const response = { status: 201 }

  try {
    const body = JSON.parse(event.body)
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall( body || {} )
    }

    const createPost = await db.send(new PutItemCommand(params))

    response.body = JSON.stringify({
      message: "Successfully created post!",
      createPost
    })
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: "Failed to create post!",
      errorMessage: error.message,
      errorStack: error.stack,
    })
  }

  return response
}

const updatePost = async (event) => {
  const response = { status: 200 }

  try {
    const body = JSON.parse(event.body)
    const objectKeys = Object.keys(body)
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({postId: event.pathParameters.postId}),
      UpdateExpression: `SET ${objectKeys.map((_, index) => `#key${index} =:value${index}`).join(", ")}`,
      ExpressionAttributeNames: objectKeys.reduce((acc, key, index) => ({
        ...acc,
        [`#key${index}`]: key,
      }), {}),
      ExpressionAttributeValues: marshall(objectKeys.reduce((acc, key, index) => ({
        ...acc,
        [`:value${index}`]: body[key]
      }), {}))
    }

    const updatePost = await db.send(new UpdateItemCommand(params))

    response.body = JSON.stringify({
      message: "Successfully updated post!",
      updatePost
    })
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: "Failed to update post!",
      errorMessage: error.message,
      errorStack: error.stack,
    })
  }

  return response
}

const deletePost = async (event) => {
  const response = { status: 200 }

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({postId: event.pathParameters.postId}),
    }

    const deletePost = await db.send(new UpdateItemCommand(params))

    response.body = JSON.stringify({
      message: "Successfully deleted post!",
      deletePost
    })
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: "Failed to delete post!",
      errorMessage: error.message,
      errorStack: error.stack,
    })
  }

  return response
}

const getPosts = async (event) => {
  const response = { status: 200 }

  try {
    const {Items} = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }))

    response.body = JSON.stringify({
      message: "Successfully fetched all posts!",
      data: Items.map((item) => unmarshall(item)),
      Items
    })
  } catch (error) {
    console.log(error)
    response.statusCode = 500
    response.body = JSON.stringify({
      message: "Failed to fetch!",
      errorMessage: error.message,
      errorStack: error.stack,
    })
  }

  return response
}

module.exports = {
  getPost, createPost, updatePost, deletePost, getPosts
}
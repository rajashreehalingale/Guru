'use strict'
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-1" });
const dDb = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

const getMyCollegeItem = async (userId) => {
  let params = {
    TableName: "myCollege",
    key: {
      userId: userId
    }
  };

  try {
    const data = await documentClient.get(params).promise();

    console.log(data)

    return data
  } catch (err) {
    console.log(err)

    return err
  }
}

const putMyCollegeItem = async (userId, state, city, schoolType) => {
  let params = {
    TableName: "myCollege",
    Item: {
      userId: userId,
      state: state,
      city: city,
      schoolType: schoolType
    }
  };

  try {
    const data = await documentClient.put(params).promise();  // documentClient.get(params).promise();

    return data
  } catch (err) {
    console.log(err)

    return err
  }
}

module.exports = {
  getMyCollegeItem,
  putMyCollegeItem
}

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { nanoid } from 'nanoid';

const dynamoDBClient = new DynamoDBClient({ region: 'us-west-1' });

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let input_text = '';
    let input_file_path = '';
    if (event.body) {
        const body = JSON.parse(event.body);
        input_text = body.input_text || '';
        input_file_path = body.input_file_path || '';
    }

    const id = nanoid();

    console.log('textInput:', input_text);
    console.log('s3Url:', input_file_path);

    const item = marshall({
        id: id,
        input_text: input_text,
        input_file_path: input_file_path
    });

    console.log("ITEMS ::>> ", item)
    
    const params = {
        TableName: 'File_Details',
        Item: item
    };

    try {
        await dynamoDBClient.send(new PutItemCommand(params));
        console.log('Item inserted into DynamoDB successfully');
    } catch (error) {
        console.error('Error inserting item into DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error inserting item into DynamoDB'
            })
        };
    }

    const response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST"
        },
        body: JSON.stringify({ 
            message: `Received textInput: ${input_text} and s3Url: ${input_file_path}`,
            id: id
        })
    };

    return response;
};
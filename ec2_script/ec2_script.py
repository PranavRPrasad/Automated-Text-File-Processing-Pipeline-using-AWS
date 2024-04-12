import boto3
import sys
import os

dynamodb = boto3.client('dynamodb')
s3 = boto3.client('s3')

def download_file_from_dynamodb_by_id(id):

    try:
        response = dynamodb.get_item(
            TableName='File_Details',
            Key={'id': {'S': id}}
        )
    except dynamodb.exceptions.ClientError as e:
        print("Error:", e.response['Error']['Message'])
        return None, None

    item = response.get('Item', {})
    input_text = item.get('input_text', {}).get('S', '')
    input_file_path = item.get('input_file_path', {}).get('S', '')

    if '/' in input_file_path:
        bucket_name, file_name = input_file_path.split('/', 1)
        try:
            s3.download_file(bucket_name, file_name, file_name)
            print(f"File downloaded from S3: {file_name}")
        except Exception as e:
            print("Error downloading file from S3:", e)
            return None, None
    else:
        print("Invalid input file path format. Expected format: 'bucket_name/file_name'")
        return None, None

    return input_text, file_name

def save_output_file(input_text, file_name):
    try:
        with open(file_name, 'r') as file:
            file_content = file.read()
    except FileNotFoundError:
        print(f"Error: File {file_name} not found")
        return

    content_with_input_text = f"{file_content.rstrip()}:{input_text}"

    with open('output.txt', 'w') as output_file:
        output_file.write(content_with_input_text)
        print("Output file 'output.txt' saved successfully")

    return 'output.txt'

def upload_file_to_s3(bucket_name, file_name):
    try:
        s3.upload_file(file_name, bucket_name, file_name)
        print(f"File '{file_name}' uploaded to S3 bucket '{bucket_name}' successfully")
    except Exception as e:
        print("Error uploading file to S3 bucket:", e)

def update_dynamodb_output_path(id, output_file_path):
    try:
        response = dynamodb.update_item(
            TableName='File_Details',
            Key={'id': {'S': id}},
            UpdateExpression='SET output_file_path = :val',
            ExpressionAttributeValues={':val': {'S': output_file_path}},
            ReturnValues='UPDATED_NEW'
        )
        print("Output file path updated in DynamoDB successfully")
    except dynamodb.exceptions.ClientError as e:
        print("Error updating DynamoDB:", e.response['Error']['Message'])

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <id> <bucket_name>")
        sys.exit(1)

    execution_id = sys.argv[1]  
    bucket_name = sys.argv[2]  

    input_text, file_name = download_file_from_dynamodb_by_id(execution_id)

    output_file_path = save_output_file(input_text, file_name)

    upload_file_to_s3(bucket_name, output_file_path)

    update_dynamodb_output_path(execution_id, f"{bucket_name}/{output_file_path}")

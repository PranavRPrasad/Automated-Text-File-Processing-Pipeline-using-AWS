# Prerequisites
+ Ensure you have the latest LTS (version 20.12.2 LTS) of [Node.js](https://nodejs.org/en/download/current) installed on your local system.
+ An [AWS account](https://aws.amazon.com/free/?gclid=EAIaIQobChMIic2Z0LC9hQMVejfUAR2KrgyrEAAYASAAEgJgBvD_BwE&trk=6a4c3e9d-cdc9-4e25-8dd9-2bd8d15afbca&sc_channel=ps&ef_id=EAIaIQobChMIic2Z0LC9hQMVejfUAR2KrgyrEAAYASAAEgJgBvD_BwE:G:s&s_kwcid=AL!4422!3!651751059783!e!!g!!aws!19852662197!145019195897&all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all).

# Setup/Configuration
1. Sign in to your AWS account and navigate to the AWS Management Console.
2. On top-right, select the region 'us-west-1'.
3. Search for 'IAM', click on it and in the left-hand navigation pane, under 'Access management', select 'Users' and click on 'Create user'.
4. Give a relevant 'User name' (for eg: react-web) and attach the policy 'AdministratorAccess' to it.
5. Select the user you created, copy both the access key and the secret access key and save them in a safe location as you need them later.
6. Search for 'S3', click on it and in the left-hand navigation pane, under 'Buckets', create a general purpose bucket by clicking on 'Create bucket', give a relevant bucket name (for eg: pranav-file-upload-storage) and keep other settings same.
7. Select the bucket you created, under 'Permissions' tab, edit the 'Cross-origin resource sharing (CORS)' by pasting the following code snippet:
    ```
    [
        {
            "AllowedHeaders": [
                "*"
            ],
            "AllowedMethods": [
                "PUT",
                "POST",
                "DELETE",
                "GET"
            ],
            "AllowedOrigins": [
                "*"
            ],
            "ExposeHeaders": []
        }
    ]
    ```
8. Search for 'API Gateway', click on it and in the left-hand navigation pane, under 'APIs', create a REST API by clicking on 'Create API', choose 'REST API' as the API type and click on 'Build'.
9. In 'API details', give a relevant name (for eg: upload-file) for the API name and click on 'Create API'.
10. Select the API you created, click on 'Create resource' give a relevant Resource name (eg: file), checkmark 'CORS (Cross Origin Resource Sharing)' and click on 'Create resource'.
11. Select the created resource, click on 'Create method' by select method type as POST and keeping the other settings the same.
12. Search for 'Lambda', click on it and in the left-hand navigation pane, under 'Functions', click on 'Create function' by giving a relevant function name (for eg: 'process-request') and keeping the other settings the same.
13. Give a relevant role name (for eg: process-request-lambda-role) and attach the policy 'AmazonDynamoDBFullAccess' to it.
14. Search for 'Lambda' again, click on it and in the left-hand navigation pane, under 'Functions', click on 'Create function' by giving a relevant function name (for eg: 'create-ec2-instance') and keeping the other settings the same.
15. Give a relevant role name (for eg: create-ec2-instance-lambda-role) and attach the policies 'AmazonDynamoDBFullAccess', 'AmazonEC2FullAccess' and 'AmazonS3FullAccess' to it.
16. Search for 'DynamoDB', click on it and in the left-hand navigation pane, select 'Dashboard', and in the right, click on 'Create table' by giving a relevant table name (for eg: File_Details), the partition key as 'id' and keeping the other settings the same.
17. Clone the repository or Download zip into your local system.

# Steps to run the application
1. Select the API you've created and in the left-hand avigation pane, expand 'API: upload-file' and select 'Stages'. Create a stage by giving a relevant stage name (for eg: test) and keeping the other settings the same.
2. Select the stage you created, copy the 'Invoke URL' ans save it in a safe location as you need it later.
3. Select the first Lambda function you created (process-request) and zip the entire 'process_request_lambda_code' folder here. If you get any error, try renaming the 'process-request-lambda.mjs' file to 'index.mjs'.
4. Check the screenshot named '' under the Screenshots folder to verify the folder structure of the Lambda.
5. Under the 'Configuration' tab, navigate to 'Triggers' and add a trigger by clicking on 'Add trigger'. Select the source for trigger configuration as 'API Gateway', select 'Use existing API' and give the API you created and click 'Add'.
6. Come back to the 'Code' tab and click on 'Deploy' to deploy the changes.
6. Navigate to the S3 bucket you've created and upload the script 'ec2_script.py' here.
7. Search for 'AMIs' on the main search bar, click on it and in the dropdown, select 'Public Images' and search for 'Amazon Linux'. Select the first AMI ID and copy the same. Save it in a safe location as you need it later.
8. Search for 'Key pairs' on the main search bar, click on it. Right top, click on 'Create key pair' by giving a relevant name (for eg: test-server-key) and keeping the other settings the same.
9. Search for 'VPC', click on it and in the left-hand navigation pane, under 'Virtual private cloud', select 'Subnets' and copy the first Subnet ID. Save it in a safe location as you need it later.
10. Select the second Lambda function you created (create-ec2-instance) and zip the entire 'create_ec2_instance_lambda_code' folder here. If you get any error, try renaming the 'create_ec2_instance.py' file to 'lambda_function.py'.
11. Check the screenshot named '' under the Screenshots folder to verify the folder structure of the Lambda.
12. Under the 'Configuration' tab, navigate to 'Environment variables' and add the following variables:
    + Key: AMI, Value: '___Insert your AMI ID here___'
    + Key: BUCKET_NAME, Value: '___Insert your bucket name here___'
    + Key: DDB_TABLE_NAME, Value: '___Insert your database table name here___'
    + Key: INSTANCE_METADATA_SERVICE_PATH, Value: http://169.254.169.254/latest/meta-data/instance-id
    + Key: INSTANCE_TYPE, Value: t2.micro
    + Key: KEY_NAME, Value: '___Insert your key pair name here___'
    + Key: LOCAL_SCRIPT_PATH, Value: /home/ec2-user/
    + Key: MY_AWS_ACCESS_KEY_ID, Value: '___Insert your AWS access key here___'
    + Key: MY_AWS_REGION, Value: us-west-1
    + Key: MY_AWS_SECRET_ACCESS_KEY, Value: '___Insert your AWS secret access key here___'
13. Under the 'Configuration' tab, navigate to 'Triggers' and add a trigger by clicking on 'Add trigger'. Select the source for trigger configuration as 'DynamoDB', enter the DynamoDB table (File_Details), limit the batch size to 1 if you want, keep the other settings the same and click on 'Add' (Ensure the stream option of the DynamoDB is on).
14. Come back to the 'Code' tab and click on 'Deploy' to deploy the changes.
15. Navigate to the Projects folder in your local system. Further, navigate to the 'file-upload-system' folder and open the .env file and please fill it with all the credentials. Make sure the region is 'us-west-1'.
16. In the same path, run 'npm start'. Open the localhost. Give a text input (optional) and upload a .txt file (required). Click on 'Submit'.
17. You'll be shown that the file is uploaded successfully and an EC2 instance (Amazon Linux VM) created.
18. Open the AWS Managemenet Console and navigate to the EC2 dashboard. Click on instances to check if the instance is running.
19. Now, navigate to the S3 bucket (pranav-file-upload-storage) you created. The '___input-filename.txt___' is uploaded to the S3 bucket.
20. Then, navigate to the DynamoDB table (File_Details) you created. The first 3 attributes (id, input_text and input_file_path) are updated.
21. Wait for some time for the VM to complete the remaining tasks (downloading the ec2_script.py file to the EC2 instance, updating the database with the output_file_path).
22. Come back to S3 bucket to check if the file 'output.txt' has also been uploaded. Navigate to the DynamoDB table and check if the 4th attribute (output_file_path) has also been updated.
23. Go back to the EC2 dashboard, click on instances and verify if the created instance has terminated.

# Limitations
1. Minimal front-end.
2. Not a lot of error-handling.
3. Isn't deployed on AWS. So, it can be tested only locally for now.

# NOTE
+ To connect to the created EC2 instance manually, please ensure that the inbound and outbound rules of the security groups of the EC2 instance are having access to SSH via port 22 as shown in the screenshot named '' under the Screenshots folder. Right click on the created instance and click on 'Connect' to test the VM manually.
+ Relevant screenshots are attached in the Screenshots folder.

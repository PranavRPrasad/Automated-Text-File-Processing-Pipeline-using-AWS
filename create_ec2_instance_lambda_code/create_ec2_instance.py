import os
import boto3

AMI = os.environ['AMI']
INSTANCE_TYPE = os.environ['INSTANCE_TYPE']
KEY_NAME = os.environ['KEY_NAME']
SUBNET_ID = os.environ['SUBNET_ID']
BUCKET_NAME = os.environ['BUCKET_NAME']
SCRIPT_KEY = os.environ['SCRIPT_KEY']
LOCAL_SCRIPT_PATH = os.environ['LOCAL_SCRIPT_PATH']
MY_AWS_ACCESS_KEY_ID = os.environ['MY_AWS_ACCESS_KEY_ID']
MY_AWS_SECRET_ACCESS_KEY = os.environ['MY_AWS_SECRET_ACCESS_KEY']
MY_AWS_REGION = os.environ['MY_AWS_REGION']
INSTANCE_METADATA_SERVICE_PATH = os.environ['INSTANCE_METADATA_SERVICE_PATH']

ec2 = boto3.client('ec2')

def lambda_handler(event, context):
    print(event)
    event_name = event['Records'][0]['eventName']
    if event_name == 'INSERT':
        event_id = event['Records'][0]['dynamodb']['Keys']['id']['S']
        user_data_script = f"""#!/bin/bash
        # Automate aws configure before copying the script
        aws configure set aws_access_key_id {MY_AWS_ACCESS_KEY_ID}
        aws configure set aws_secret_access_key {MY_AWS_SECRET_ACCESS_KEY}
        aws configure set default.region {MY_AWS_REGION}
        aws s3 cp s3://{BUCKET_NAME}/{SCRIPT_KEY} {LOCAL_SCRIPT_PATH}
        export AWS_ACCESS_KEY_ID={MY_AWS_ACCESS_KEY_ID}
        export AWS_SECRET_ACCESS_KEY={MY_AWS_SECRET_ACCESS_KEY}
        export AWS_REGION={MY_AWS_REGION}
        sudo yum install -y python3-boto3
        python3 {LOCAL_SCRIPT_PATH}/{SCRIPT_KEY} {event_id} {BUCKET_NAME}
        INSTANCE_ID=$(TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"` && curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
        aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region {MY_AWS_REGION}
        """
    
        response = ec2.run_instances(
            ImageId=AMI,
            InstanceType=INSTANCE_TYPE,
            KeyName=KEY_NAME,
            SubnetId=SUBNET_ID,
            MaxCount=1,
            MinCount=1,
            UserData=user_data_script
        )
        
        instance_id = response['Instances'][0]['InstanceId']
        print("New instance created:", instance_id)

    else:
        pass
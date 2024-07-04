import { Stack as CdkStack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecsContainer from './ecs-container';
import * as s3Bucket from './s3-bucket';

export class Stack extends CdkStack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		const { bucket } = s3Bucket.attach(this);
		ecsContainer.attach(this, bucket);
	}
}

// ducktors/turborepo-remote-cache

import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export const attach = (construct: Construct, bucket: Bucket) => {
	const cluster = new Cluster(construct, 'TurborepoCacheServerCluster', {
		capacity: {
			instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
			desiredCapacity: 1,
		},
	});

	const service = new ApplicationLoadBalancedFargateService(construct, 'TurborepoCacheService', {
		cluster,
		taskImageOptions: {
			image: ContainerImage.fromRegistry('ducktors/turborepo-remote-cache'),
			containerPort: 3000,
			environment: {
				TURBO_TOKEN: '[A valid token]',
				STORAGE_PROVIDER: 's3',
				STORAGE_PATH: bucket.bucketName,
			},
		},
	});

	// Our health check is at a different path than /
	service.targetGroup.configureHealthCheck({
		path: '/v8/artifacts/status',
	});

	// Add access to bucket
	bucket.addToResourcePolicy(
		new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['s3:*'],
			resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
			principals: [new ArnPrincipal(service.taskDefinition.obtainExecutionRole().roleArn)],
		})
	);

	return { cluster, service };
};

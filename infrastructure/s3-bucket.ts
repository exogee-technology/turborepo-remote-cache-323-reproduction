import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export const attach = (construct: Construct) => {
	const bucket = new Bucket(construct, 'TurborepoCacheBucket', {
		// The things in this bucket are not special at all. They can be deleted at any time.
		removalPolicy: RemovalPolicy.DESTROY,
		autoDeleteObjects: true,

		lifecycleRules: [
			{
				// Delete objects after 60 days so we don't balloon forever.
				expiration: Duration.days(60),
			},
		],
	});

	return { bucket };
};

console.log("Version 0.1");

var AWS = require('aws-sdk');
var async = require('async');

function createS3(regionName) {
    var config = { apiVersion: '2006-03-01' };

    if (regionName != null)
        config.region = regionName;

    var s3 = new AWS.S3(config);
    return s3;
}

exports.handler = function (event, context) {

    if (event.Records == null) {
        context.fail('Error', "Event has no records.");
        return;
    }

    async.each(event.Records, processRecord, function (err) {
        if (err) {
            context.fail('Error', "One or more objects could not be copied.");
        } else {
            context.succeed();
        }
    });
};

function processRecord(record, callback) {

    // The source bucket and source key are part of the event data
    var srcBucket = record.s3.bucket.name;
    var srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Get the target bucket(s) based on the source bucket.
    getTargetBuckets(srcBucket, function (err, targets) {
        if (err) {
            console.log("Error getting target bucket: "); // an error occurred
            console.log(err, err.stack); // an error occurred
            callback("Error getting target bucket from source bucket '" + srcBucket + "'");
            return;
        }

        async.each(targets, function (target, callback) {

            var targetBucket = target.bucketName;
            var regionName = target.regionName;
            var targetBucketName = targetBucket;
            if (regionName != null)
                targetBucketName = targetBucketName + "@" + regionName;
            var targetKey = srcKey;

            console.log("Copying files from '" + srcBucket + "' to '" + targetBucketName + "'");

            // Copy the object from the source bucket
            var s3 = createS3(regionName);
            s3.copyObject({
                Bucket: targetBucket,
                Key: targetKey,

                CopySource: encodeURIComponent(srcBucket + '/' + srcKey),
                MetadataDirective: 'COPY'
            }, function (err, data) {
                if (err) {
                    console.log("Error copying '" + srcKey + "' from '" + srcBucket + "' to '" + targetBucketName + "'");
                    console.log(err, err.stack);
                    callback("Error copying '" + srcKey + "' from '" + srcBucket + "' to '" + targetBucketName + "'");
                } else {
                    callback();
                }
            });
        }, function (err) {
            if (err) {
                callback(err);
            } else {
                callback();
            }
        });
    });
};

// getTargetBuckets from tags
function getTargetBuckets(bucketName, callback) {
    console.log("Getting tags for bucket '" + bucketName + "'");

    var s3 = createS3();
    s3.getBucketTagging({
        Bucket: bucketName
    }, function (err, data) {
        if (err) {
            if (err.code == 'NoSuchTagSet') {
                callback("Source bucket '" + bucketName + "' is missing 'TargetBucket' tag.", null);
            } else {
                callback(err, null);
            }
            return;
        }

        console.log(data);
        var tags = data.TagSet;

        console.log("Looking for 'TargetBucket' tag");
        for (var i = 0; i < tags.length; ++i) {
            var tag = tags[i];
            if (tag.Key == 'TargetBucket') {
                console.log("Tag 'TargetBucket' found with value '" + tag.Value + "'");

                var tagValue = tag.Value.trim();
                var buckets = tag.Value.split(' ');

                var targets = [];

                for (var i = 0; i < buckets.length; ++i) {
                    var bucketSpec = buckets[i].trim();
                    if (bucketSpec.length == 0)
                        continue;

                    var specParts = bucketSpec.split('@');

                    var bucketName = specParts[0];
                    var regionName = specParts[1]

                    targets.push({ bucketName: bucketName, regionName: regionName });
                }

                callback(null, targets);
                return;
            }
        }

        callback("Tag 'TargetBucket' not found", null);
    });
}

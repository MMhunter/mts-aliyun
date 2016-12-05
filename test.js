/**
 * @file test.js.js
 *
 * TODO: 写下这个文件是做什么的
 *
 * Created by mmhunter on 12/5/16.
 */

var MTSHelper = require("./helper");

var helper = new MTSHelper({
    Region: 'cn-beijing',
    AccessKeyId: 'ss9R6ibZylr1QgcX',
    AccessKeySecret: '2LyCNL6vEN5EEO8ICy8loSrfSkCNmv',
    PipelineId:"926d843e15af4e95a434cb8dace398e5",
    "WaterMarks":[{
        "InputFile":{
            "Bucket":"wecarepet-test",
            "Location":"oss-cn-beijing",
            "Object":"120icon.png"
        },
        "WaterMarkTemplateId":"60727d24826846ae82e4199314d7b8ea"
    }]
});

helper.addAnalyzeObject({
    "Bucket": "wecarepet-test",
    "Location": "oss-cn-beijing",
    "Object":"training-asset-2"
}).then(function(res){
    console.log(res);
});
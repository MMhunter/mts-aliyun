/**
 * @file helper.js
 *
 * TODO: 写下这个文件是做什么的
 *
 * Created by mmhunter on 12/5/16.
 */


var AliyunMTS = require("./client");

var Promise = require("bluebird");

function MTSHelper(options,checkInterval){

    var analyzeJobs = [];
    var convertJobs = [];
    if(checkInterval == null) checkInterval = 5000;

    var mtsClient = new AliyunMTS({
        Region:  options.Region,
        AccessKeyId: options.AccessKeyId,
        AccessKeySecret: options.AccessKeySecret,
    });


    var processingInputs = [];

    var current_last_id = 1;


    function defer() {
        var deferred = {};

        deferred.promise = new Promise(function(resolve,reject){
            deferred.resolve = resolve;
            deferred.reject = reject;
        });

        return deferred;
    }

    function analyze(Input){
        var deferred = defer();
        mtsClient.SubmitAnalysisJob(Input,options.PipelineId).then(function(job){
            return analyzeJobs.push({
                deferred:deferred,
                JobId:job.Id,
            });
        });
        return deferred.promise;
    };

    function checkAlayzeJobs(){
        for(var i = 0;i< Math.ceil(analyzeJobs.length / 10);i++ ){
            var ids = analyzeJobs.slice(i*10,10);
            mtsClient.QueryAnalysisJobList(ids.map(function(i){return i.JobId})).then(function(jobs){
                jobs.forEach(function(job){
                    if(job.State === 'Success'){
                        var anaylzeJob = removeJobsFromArray(analyzeJobs,job.Id)[0];
                        anaylzeJob.deferred.resolve(job);
                    }
                })
            });
        }
    }

    function removeJobsFromArray(array,JobId){
        for(var i = 0; i < array.length;i++){
            if(array[i].JobId === JobId){
                return array.splice(i,1);
            }
        }
        return [];
    }



    function submitJob(Input){

        console.log("开始转码"+Input.Object);

        var deferred = defer();

        var Output =
            {
                "OutputObject":Input.Object,
                "TemplateId":"S00000000-200020"
            };

        if(options.WaterMarks != null){
            Output.WaterMarks = options.WaterMarks;
        }

        mtsClient.SubmitJobs(Input,[Output],options.PipelineId,Input.Bucket,Input.Location).then(function(jobs){
            jobs.forEach(function(job){
                convertJobs.push({
                    deferred:deferred,
                    JobId:job.Job.JobId,
                });
            });
        });

        return deferred.promise;
    }

    function findObjArrayBy(array,field,value) {
        for(var i = 0; i < array.length;i++){
            if(array[i][field] === value){
                return array[i];
            }
        }
        return null;
    }

    function checkJobs(){
        for(var i = 0;i< Math.ceil(convertJobs.length / 10);i++ ){
            var ids = convertJobs.slice(i*10,10);
            mtsClient.QueryJobList(ids.map(function(i){return i.JobId})).then(function(jobs){
                jobs.forEach(function(job){
                    if(job.State === 'TranscodeSuccess'){
                        var j = removeJobsFromArray(convertJobs,job.JobId)[0];
                        if(j != null){
                            j.deferred.resolve(job);
                        }
                    }
                })
            });
        }
    }

    setInterval(checkAlayzeJobs,checkInterval);
    setInterval(checkJobs,checkInterval);

    return {
        addAnalyzeObject:function(input){
            return analyze(input).then(function(){
                return submitJob(input);
            })
        }
    }
}


module.exports = MTSHelper;









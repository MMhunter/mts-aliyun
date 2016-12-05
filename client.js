/**
 * @file index.js.js
 *
 * TODO: 写下这个文件是做什么的
 *
 * Created by mmhunter on 12/5/16.
 */


var rp = require("request-promise");
var util = require("util");
var crypto = require('crypto');





function AliyunMTS(options){

    this.options = {
        Region:"cn-beijing",
        AccessKeyId:"",
        AccessKeySecret:""
    };

    this.options = mergeDict(this.options,options);

}

AliyunMTS.prototype.doRequest= function(params,options){

    params = mergeDict({
        Format:"JSON",
        Version:"2014-06-18",
        SignatureVersion:"1.0",
        AccessKeyId:this.options.AccessKeyId,
        SignatureMethod:"HMAC-SHA1"
    },params);


    options = mergeDict({
        host: "http://mts."+this.options.Region+".aliyuncs.com",
        uri:"/",
        method:"GET",
    },options);


    params.Timestamp = new Date().toISOString().replace(/\..+/, '')+"Z";

    params.SignatureNonce = randomStr(10);

    params.Signature = this.getSignature(options.method,params);

    return rp( {
        uri: options.host+options.uri,
        qs: params,
        json:true,
        method:options.method
    }).then(function (res) {
        //console.log(util.inspect(res, {showHidden: false, depth: null}));
        return res;
    }).catch(function (err) {
            // API call failed...
        console.error(err);
    });
};

AliyunMTS.prototype.getSignature = function(method,params){

    var stringToSign = method + "&" +encodeURIComponent("/") + "&" +encodeURIComponent(getParamsStringWithoutSignature(params));

    var hmac =  crypto.createHmac('sha1', this.options.AccessKeySecret+"&");

    hmac.update(stringToSign);

    return hmac.digest("base64");

};

AliyunMTS.prototype.QueryMediaInfoJobList = function(jobIdsArr){
    return this.doRequest({
        Action:"QueryMediaInfoJobList",
        MediaInfoJobIds:jobIdsArr.join(",")
    });
};


AliyunMTS.prototype.QueryJobList = function (jobIds) {
    return this.doRequest({
        Action:"QueryJobList",
        JobIds:jobIds.join(",")
    }).then(function(res){
        return res.JobList.Job;
    });
};

AliyunMTS.prototype.SubmitJobs = function (Input,Outputs,PipelineId,OutputBucket,OutputLocation) {
    return this.doRequest({
        Action:"SubmitJobs",
        Input:JSON.stringify(Input),
        Outputs:JSON.stringify(Outputs),
        OutputBucket:OutputBucket,
        OutputLocation:OutputLocation,
        PipelineId:PipelineId
    }).then(function(res){
        return res.JobResultList.JobResult;
    });
};


AliyunMTS.prototype.QueryAnalysisJobList = function (jobIds) {
    return this.doRequest({
        Action:"QueryAnalysisJobList",
        AnalysisJobIds:jobIds.join(",")
    }).then(function(res){
        return res.AnalysisJobList.AnalysisJob;
    });
};

AliyunMTS.prototype.SubmitAnalysisJob = function (Input,PipelineId ) {
    return this.doRequest({
        Action:"SubmitAnalysisJob",
        Input:JSON.stringify(Input),
        PipelineId:PipelineId
    }).then(function(res){
        return res.AnalysisJob;
    });
};


function getParamsStringWithoutSignature(params){

    var arrParam = [];

    for(var key in params){
        if(params.hasOwnProperty(key) && params[key] != null){
            arrParam.push({
                key:key,
                value:params[key]
            })
        }
    }

    arrParam = arrParam.sort(function(p1,p2){
        if(p1.key > p2.key) return 1;
        else if(p1.key < p2.key) return -1;
        else return 0;
    });

    return arrParam.map(function(p){
        return encodeURIComponent(p.key)+"="+encodeURIComponent(p.value);
    }).join("&");

}


function mergeDict(defaultDict,dict){

    var result = {};
    var key;

    if(defaultDict != null) {

        for (key in defaultDict) {
            if (defaultDict.hasOwnProperty(key) && defaultDict[key] != null) {
                result[key] = defaultDict[key];
            }
        }
    }

    if(dict != null) {

        for (key in dict) {
            if (dict.hasOwnProperty(key) && dict[key] != null) {
                result[key] = dict[key];
            }
        }
    }

    return result;
}

function getSignature(params){

}

function randomStr(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


module.exports = AliyunMTS;
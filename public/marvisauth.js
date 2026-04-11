//var uri = "https://localhost:8031/marvisauth/"; //Secure
var uri = "http://localhost:8031/marvisauth/"; //Non-Secure
//var uri = "http://rd.mxface.ai:8031/marvisauth/";


function GetMarvisAuthInfo() {
    return PostMarvisAuthClient("info", "", 0);
}

function CaptureIris(timeout, quality) {
    var MarvisAuthRequest = {
        "TimeOut": timeout,
        "Quality": quality
    };
    var jsondata = JSON.stringify(MarvisAuthRequest);
    return PostMarvisAuthClient("capture", jsondata);
}

function GetImage(imgformat) {
    var MarvisAuthRequest = {
        "ImgFormat": imgformat
    };
    var jsondata = JSON.stringify(MarvisAuthRequest);
    return PostMarvisAuthClient("getimage", jsondata);
}

function UnInit() {
    return PostMarvisAuthClient("uninit", "", 0);
}


function PostMarvisAuthClient(method, jsonData, isBodyAvailable) {
    var res;
    if (isBodyAvailable == 0) {
        $.support.cors = true;
        var httpStaus = false;
        $.ajax({
            type: "POST",
            async: false,
            crossDomain: true,
            url: uri + method,
            contentType: "application/json; charset=utf-8",
            //data: jsonData,
            dataType: "json",
            processData: false,
            success: function (data) {
                httpStaus = true;
                res = { httpStaus: httpStaus, data: data };
            },
            error: function (jqXHR, ajaxOptions, thrownError) {
                res = { httpStaus: httpStaus, err: getHttpError(jqXHR) };
            },
        });
    }
    else {
        $.support.cors = true;
        var httpStaus = false;
        $.ajax({
            type: "POST",
            async: false,
            crossDomain: true,
            url: uri + method,
            contentType: "application/json; charset=utf-8",
            data: jsonData,
            dataType: "json",
            processData: false,
            success: function (data) {
                httpStaus = true;
                res = { httpStaus: httpStaus, data: data };
            },
            error: function (jqXHR, ajaxOptions, thrownError) {
                res = { httpStaus: httpStaus, err: getHttpError(jqXHR) };
            },
        });
    }
    return res;
}
function GetMarvisAuthClient(method) {
    var res;
    $.support.cors = true;
    var httpStaus = false;
    $.ajax({
        type: "GET",
        async: false,
        crossDomain: true,
        url: uri + method,
        contentType: "application/json; charset=utf-8",
        processData: false,
        success: function (data) {
            httpStaus = true;
            res = { httpStaus: httpStaus, data: data };
        },
        error: function (jqXHR, ajaxOptions, thrownError) {
            res = { httpStaus: httpStaus, err: getHttpError(jqXHR) };
        },
    });
    return res;
}
function getHttpError(jqXHR) {
    var err = "Unhandled Exception";
    if (jqXHR.status === 0) {
        err = 'Service Unavailable';
    } else if (jqXHR.status == 404) {
        err = 'Requested page not found';
    } else if (jqXHR.status == 500) {
        err = 'Internal Server Error';
    } else if (thrownError === 'parsererror') {
        err = 'Requested JSON parse failed';
    } else if (thrownError === 'timeout') {
        err = 'Time out error';
    } else if (thrownError === 'abort') {
        err = 'Ajax request aborted';
    } else {
        err = 'Unhandled Error';
    }
    return err;
}


/////////// Classes

function Biometric(BioType, BiometricData, Pos, Nfiq, Na) {
    this.BioType = BioType;
    this.BiometricData = BiometricData;
    this.Pos = Pos;
    this.Nfiq = Nfiq;
    this.Na = Na;
}

function MarvisAuthRequest(BiometricArray) {
    this.Biometrics = BiometricArray;
}
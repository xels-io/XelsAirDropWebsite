let api_url = window.location.origin;

var ApiConsoleCtrl = function ($scope, $http, $location) {

    $scope.apiInfo = null;
    $scope.setApiInfo = null;

    // binding variable
    $scope.userAgent = null;
    $scope.token = null;
    $scope.method = null;
    $scope.profiler = null;
    $scope.url = null;
    $scope.queryParameter = null;
    $scope.requestSignature = null;
    $scope.baseString = null;
    $scope.requestBody = null;

    $scope.sendTimes = null;

    $scope.response = null;
    $scope.responseHeader = null;
    $scope.responseBody = null;

    server_key = getServerKey();

    // APIデータ読�?�込�?�.
    $http.get(getConsoleBaseDir('js/apis.json')).success(
            function (data) {
                $scope.apiInfo = data;
            });

    // API情報をセット.
    $scope.setApi = function (api) {

        var apidata = $scope.apiInfo[api];

        $scope.method = apidata.method;
        $scope.url = getUrl(apidata.action);
        $scope.queryParameter = apidata.query;
        $scope.requestBody = apidata.json;

        var crypt = false;
        if (apidata.crypt !== undefined) {
            crypt = apidata.crypt;
        }

        var signature = false;
        if (apidata.signature !== undefined) {
            signature = apidata.signature;
        }

        $scope.setApiInfo = {
            "name": api,
            "title": apidata.title,
            "method": apidata.method,
            "host": getRequestHost(),
            "path": getApiBaseDir(apidata.action),
            "query": apidata.query,
            "url": getUrl(apidata.action, apidata.query),
            "crypt": crypt,
            "signature": signature
        };
        $scope.responseHeader = null;
        $scope.responseBody = null;

        $scope.response = {};

    }

    // �?�在�?�択中�?�API�?�li�?素�?�セット�?�るクラス.
    $scope.activeApiClass = function (api) {

        if ($scope.apiInfo != undefined && api == $scope.apiInfo.name) {
            return "active";
        } else {
            return "";
        }
    }

    // Request Hash用�?�キーを�?�択
    function getServerKey() {
        var keyDev = document.getElementsByName('createKey')[0].value;//"1234567890";
        //console.log(keyDev);
        //var keyPro = "X9n6ahNU5bvTeM9PmYWg8xPuC1k3mdl4";
        //var proHosts = /^(prod|pro|pro-mirror|pre-pro|sta|ex-dbg|ex-dbg2|stress-test)-(ios|android)\./i;
        //var host = $location.host();
        return keyDev;
        //return (proHosts.test(host)) ? keyPro : keyDev;
    }

    // Request Hash�?�ベース文字列を計算.
    function getBaseString() {

        if ($scope.setApi == undefined) {
            return;
        }

        var baseString = null;

        // baseString�?�作�?
        baseString = $scope.setApiInfo.path;

        if ($scope.queryParameter != "") {
            baseString = baseString + "?" + $scope.queryParameter;

            if ($scope.profiler == true) {
                baseString = baseString + "&" + "XDEBUG_PROFILE=1";
            }

        }

        if ("POST" == $scope.method) {
            baseString = baseString + " " + $scope.requestBody;
        }
        server_key = getServerKey()
        $scope.baseString = baseString + " " + server_key;

        return $scope.baseString;
    }

    // Requset Hash文字列を計算.
    function getRequestSignature() {
        var signature = "";

        if ($scope.setApi != undefined) {

            var digestString = "";
            var digest = CryptoJS.SHA256(getBaseString()).toString(CryptoJS.enc.hex); //;Crypto.SHA256(getBaseString(), {}); 
            signature = digest;
        }

        return signature;
    }

    // APIコンソール�?�ベース
    function getConsoleBaseDir(path) {
        //var pathname = window.location.pathname;
        var pathname = '/console/';
        console.log(pathname);

        var tmpPath;

        if (pathname.indexOf('sample', 0) !== -1) {
            tmpPath = "/sample" + path;
        } else {
            tmpPath = '/console/'+path;
        }
        console.log(tmpPath);

        return tmpPath;
    }

    // リクエスト URI�?�ベース
    function getApiBaseDir(path) {
        var pathname = window.location.pathname;

        if (pathname.indexOf('sample', 0) !== -1) {
            tmpPath = "/sample/api" + path;
        } else {
            tmpPath = '/api' + path;
        }
        return tmpPath;
    }

    // httpリクエスト�?信先URL生�?.
    function getUrl(action, query) {

        var tmpQuery = "";
        if (query != undefined && "" != query) {
            tmpQuery = "?" + query;
        }

        return getApiBaseDir(action) + tmpQuery;
    }

    function getRequestHost() {
        var scheme = $location.protocol();
        var host = $location.host();
        var port = $location.port();
        /*		if ("" != port && 80 != port) {
         host += ":" + port;
         }*/

        return scheme + ":8000//" + host;
    }

    // API呼�?�出�?�を実行.
    $scope.callApi = function () {
        if (($scope.sendTimes == null) || ($scope.sendTimes < 1))
            $scope.sendTimes = 1;

        if ($scope.apiInfo != undefined) {
            for (var i = 0; i < $scope.sendTimes; i++)
            {
                $scope.response = {};

                // http header
                $scope.requestSignature = getRequestSignature();

                $http.defaults.headers.common["token"] = $scope.token;
                $http.defaults.headers.common["X-Assassin-RequestHash"] = $scope.requestSignature;

                var opts = {};
                opts.method = $scope.method;
                opts.url = api_url + $scope.url;
                //console.log(opts);

                if ("" != $scope.queryParameter) {
                    opts.url = opts.url + '?' + $scope.queryParameter;
                    if ($scope.profiler == true) {
                        opts.url = opts.url + "&" + "XDEBUG_PROFILE=1";
                    }

                }

                if ("POST" == $scope.method) {
                    if($scope.requestBody){
                        opts.data = JSON.parse(escapeUnicode($scope.requestBody));
                    }

                    //console.log(opts); //return false;
                }
                //console.log(opts);

                $http(opts).success(function (data, status, headers, config) {
                    //console.log(status);

                 if (200 == status) {
                 $scope.response.statusClass = "alert-success";
                 } else {
                 $scope.response.statusClass = "alert-error";
                 }
                 // セッションID.
                 if (data.result && data.result.token) {
                    $scope.token = data.result.token;
                 }
                 
                 // Result response.
                 $scope.responseBody = JSON.stringify(data, null, 2);
                 $scope.responseHeader = JSON.stringify(headers, null, 2);
                 }).error(function (data, status, headers, config) {
                 $scope.response.statusClass = "alert-error";
                 $scope.responseBody = JSON.stringify(data, null, 2);
                 $scope.responseHeader = JSON.stringify(headers, null, 2);
                 }); 
                

            }
        }
    }

    function getQueryString(queryString, option) {
        var delimiter;
        if (!option || !option.hasOwnProperty('delimiter')) {
            delimiter = '&';
        } else {
            delimiter = option.delimiter;
        }

        if (queryString.length === 0) {
            return null;
        }

        var url_params = queryString.slice(queryString).split(delimiter);
        var query_strings = {};
        for (var i in url_params) {
            var query_string = url_params[i].split('=');
            query_strings[query_string[0]] = query_string[1];
        }

        return query_strings;
    }

    // Unicode エスケープ.
    function escapeUnicode(str) {
        return str.replace(/[^ -~]|\\/g, function (m0) {
            var code = m0.charCodeAt(0);
            return '\\u'
                    + ((code < 0x10) ? '000' : (code < 0x100) ? '00'
                            : (code < 0x1000) ? '0' : '') + code.toString(16);
        });
    }

    // Unicode エスケープ解除.
    function unescapeUnicode(str) {
        return str.replace(/\\u([a-fA-F0-9]{4})/g, function (m0, m1) {
            return String.fromCharCode(parseInt(m1, 16));
        });
    }

    var hexStr = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
        "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14",
        "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f",
        "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a",
        "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35",
        "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40",
        "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b",
        "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56",
        "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61",
        "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c",
        "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77",
        "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82",
        "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d",
        "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98",
        "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3",
        "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae",
        "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9",
        "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4",
        "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf",
        "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da",
        "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5",
        "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0",
        "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb",
        "fc", "fd", "fe", "ff"];

    // �?イト�?列を�?16進文字列�?�変�?�.
    function byteToHex(b) {
        return hexStr[b & 0x00ff];
    }
}

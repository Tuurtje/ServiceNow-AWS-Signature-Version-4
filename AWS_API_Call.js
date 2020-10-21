var AWS_API_Call = Class.create();
AWS_API_Call.prototype = {
    initialize: function() {
    },

    convertByteArrayToHex : function(byteArray) {
        var hex = "";
		var i;
		var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "a", "b", "c", "d", "e", "f"];
    
        for (i = 0; i < byteArray.length; i++) {
            hex += hexChar[(byteArray[i] >> 4) & 0x0f] + hexChar[byteArray[i] & 0x0f];
        }
        return hex;  
    },

    getSignatureKey_b64 : function(key, date_stamp, regionName, serviceName, request_body) {
        keyB64 = GlideStringUtil.base64Encode("AWS4" + key);
        kDate= this.sign(keyB64, "HmacSHA256", date_stamp);
        kRegion = this.sign(kDate,"HmacSHA256", regionName);
        kService = this.sign(kRegion,"HmacSHA256", serviceName);
        kSigning = this.sign(kService,"HmacSHA256", "aws4_request");
        return kSigning;
    },
    
    sign : function(key, algorithm, msg){
        var mac = new GlideCertificateEncryption;
        return mac.generateMac(key, algorithm, msg);
    },

    getamz_date : function(date_time){
        date = date_time.getDate().getByFormat("yyyyMMdd");
        time = date_time.getTime().getByFormat("HHmmss");
        return date + "T" + time + "Z";
    },

    getdate_stamp : function(date_time){
        return date_time.getDate().getByFormat("yyyyMMdd");
    },
    

    execute : function(method, service, amz_target, host, region, endpoint, access_key, secret_key, canonical_uri, canonical_querystring, request_body){
        var sha256Obj = new SHA256Hashing();
        var content_type = 'application/x-amz-json-1.1';
        var algorithm = 'AWS4-HMAC-SHA256';

        var date_time = new GlideDateTime();
        amz_date = AWS_API_Call.getamz_date(date_time);
        date_stamp = AWS_API_Call.getdate_stamp(date_time);

        var canonical_headers = 'content-type:' + content_type + '\n' + 'host:' + host + '\n' + 'x-amz-date:' + amz_date + '\n' + 'x-amz-target:' + amz_target + '\n';
        var signed_headers = 'content-type;host;x-amz-date;x-amz-target';

        // ************* TASK 1: CREATE A CANONICAL REQUEST *************
        var payload_hash = sha256Obj.SHA256(request_body);
        canonical_request = method + '\n' + canonical_uri + '\n' + canonical_querystring + '\n' + canonical_headers + '\n' + signed_headers + '\n' + payload_hash;
                
        // ************* TASK 2: CREATE THE STRING TO SIGN*************
        var credential_scope = date_stamp + '/' + region + '/' + service + '/' + 'aws4_request';
        string_to_sign = algorithm + '\n' +  amz_date + '\n' +  credential_scope + '\n' +  sha256Obj.SHA256(canonical_request);

        // ************* TASK 3: CALCULATE THE SIGNATURE *************
        var signing_key_b64 = this.getSignatureKey_b64(secret_key, date_stamp, region, service);
        signature_b64 = this.sign(signing_key_b64, "HmacSHA256", string_to_sign);
        signature = this.convertByteArrayToHex(GlideStringUtil.base64DecodeAsBytes(signature_b64));
        
        // ************* TASK 4: ADD SIGNING INFORMATION TO THE REQUEST *************
        var authorization_header = algorithm + ' ' + 'Credential=' + access_key + '/' + credential_scope + ', ' +  'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;

        var request  = new sn_ws.RESTMessageV2();  		
        request.setHttpMethod(method);      
        request.setEndpoint(endpoint);

        request.setRequestHeader('Authorization', authorization_header);	
        request.setRequestHeader('Content-Type', content_type);
        request.setRequestHeader('X-Amz-Date',amz_date);
        request.setRequestHeader('X-Amz-Target',amz_target);
        request.setRequestBody(request_body);

        var response = request.execute();  

        return response;
    },
    type: 'AWS_API_Call'
};

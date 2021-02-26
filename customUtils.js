function customUtils() {
    var emptyMatchingObject = function() {
        var matchingObject = new Object();
        matchingObject.index = -1
        matchingObject.datas = {}
        matchingObject.diffs = "Not Found"
        console.log("Index par defaut :" + matchingObject.index)
        return matchingObject;
    };
    let customUtils = {};
	customUtils.isEmptyObject = function(obj) {
    	var name;
		if (obj === null) {return false}
    	for (name in obj) {
        	return false;
    	}
    	return true;
	}
    customUtils.getNbAttrObject = function(obj) {
        var nbAttr = 0
        for (var attr in obj) { nbAttr++ }
        return nbAttr
    }
    customUtils.almostEqualDates = function almostEqualDates(dt1,dt2) {
        return true;
    }
    customUtils.compareValues = function compareValues(key,val1,val2) {
        if ( key == 'date_heure_creation' ) {
            val1 = val1.substring(1,11);
            val2 = val2.substring(1,11);
        }
        else if ( key == 'date_heure_modification' ) {
            val1 = val1.substring(1,11);
            val2 = val2.substring(1,11);
        }
        return val1 != val2;
    }
    customUtils.diff = function diff(obj1, obj2) {
        var result = {};
        var change;
        for (var key in obj1) {
            if (obj2[key] === null && obj1[key] === null) {
            } else if (obj1[key] === null) {
                result[key] = "(null)/"+obj2[key];
            } else if (obj2[key] === null) {
                result[key] = obj1[key]+"/(null)";
            } else if(typeof obj2[key] == 'object' && typeof obj1[key] == 'object') {
                change = diff(obj1[key], obj2[key]);
                if (customUtils.isEmptyObject(change) === false) {
                    result[key] = change;
                }
            }
            else if ( customUtils.compareValues(key,obj2[key],obj1[key]) ) {
                result[key] = obj1[key]+" / "+obj2[key];
            }
        }
        return result;
    }
	customUtils.closestElemInList = function(element, list) {  
		var bestMatch= emptyMatchingObject()
		if (list.length == 0) {
            return bestMatch
        }
        
		for (var i = 0; i < list.length; i++) {
			var differences = utils.diff(element, list[i].values)
            nbDiffCurrent = customUtils.getNbAttrObject(bestMatch.diffs)
            nbDiffPrevious = customUtils.getNbAttrObject(differences)
			if (bestMatch.index == -1 || nbDiffCurrent > nbDiffPrevious) {
				bestMatch.index = i
                bestMatch.datas = list[i].values
				bestMatch.diffs = differences
			}
		}
        		
		return bestMatch
	}
    customUtils.printObjectAttributes = function(obj) {
        var outputStr = ""
        for (var key in obj) {
            if (outputStr != "") { outputStr += ", "}
            if (typeof obj[key] == 'object') {
                outputStr += key + " : { " + customUtils.printObjectAttributes(obj[key]) + " }" 
            } else { outputStr += key + " : { " + obj[key] + " }" }
        }
        return outputStr
    }
    customUtils.testRecordFound = function(record, jsonResponse, message) {
        var bestMatch = emptyMatchingObject()
        if (jsonResponse.datas === undefined) {
            bestMatch.index = 1
            bestMatch.datas = jsonResponse.values
			bestMatch.diffs = utils.diff(record, jsonResponse.values)
        } else {
            bestMatch = utils.closestElemInList(record, jsonResponse.datas)
        }
        pm.test("Ligne #" + bestMatch.index + " - " + message, function () {
    pm.expect(bestMatch.diffs,"Valeurs { Attendues / Obtenues } : " + utils.printObjectAttributes(bestMatch.diffs)).to.be.empty
})
        return bestMatch.index
    }
    return customUtils;
}

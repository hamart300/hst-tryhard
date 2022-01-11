function divByZero(a,b){
    if(b==0) return "N/A"
    else return Math.floor(a/b)
}

function checkCond(query,rep,me){
    switch(query.type) {
        case "unit":
            for(var ut in rep.units[me]){
                if( query.unit==rep.units[me][ut].name && query.count<=rep.units[me][ut].count )
                    return true
            }
            break;
        case "building":
            for(var ut in rep.buildings[me]){
                if( query.building==rep.buildings[me][ut].name && query.count<=rep.buildings[me][ut].count )
                    return true
            }
            break;
        case "upgrade":
            for(var ut in rep.upgrades[me]){
                if( query.upgrade==rep.upgrades[me][ut].name)
                    return true
            }
            break;
        case "workerlost":
            const worker={"Zerg":"Drone","Terran":"SCV","Protoss":"Probe"}
            const workerlost=rep.killed_early_units[me][worker[query.race]]
            if( workerlost && -query.count>=workerlost )
                return true
            break;
        case "none":
            return true
            break;
        
        default:
            break;
    }
    return false
}

function generateStats(query,dataSet,opps=["All","Zerg","Terran","Protoss"]){
    const result={}
    for(var vs in opps){
        var res={sum:0,match:0,presenceReps:[],sumw:0,win:0,wonReps:[],sumt:0,wint:0,wontReps:[]}
        dataSet.forEach(rep => {
            if(rep.header.type==="Practice") return
            // First the map filter
            if(query.map && !rep.header.map.includes(query.map)) return
            if(query.exPlayers) {
                
                for(var i=0;i<query.exPlayers.length;i++)
                 for(var j=0;j<2;j++) {
                    if(rep.players[j].name.includes(query.exPlayers[i])) {
                        return
                    }

                 }
            }
            var me,opp;
            if( rep.race[0]==query.race) {me=0;opp=1}
            else if(rep.race[1]==query.race) {me=1;opp=0}
            else return
            if( opps[vs]!="All" && opps[vs]!=rep.race[opp] ) return
            /* The replay counts */
            res.sum++
            if(rep.race[me]!=rep.race[opp]){
                // not mirror
                if(checkCond(query,rep,me)){
                    res.match++
                    res.presenceReps.push(rep)
                    res.sumw++
                    if(rep.players[me].result=="Win") {res.win++;res.wonReps.push(rep)}
                } else {
                    res.sumt++
                    if(rep.players[me].result=="Win") {res.wint++;res.wontReps.push(rep)}
                }
            } else {
                // Mirror matchup
                const cond0=checkCond(query,rep,0)
                const cond1=checkCond(query,rep,1)
                // Counts for presence if either player goes for it
                if(cond0||cond1) {res.match++;res.presenceReps.push(rep)}
                // Does not count for winrates if both or neither player goes for it
                if(cond0&&cond1) return
                if(!cond0&&!cond1) return
                res.sumw++
                res.sumt++
                if( cond0 && rep.players[0].result=="Win" ) {res.win++;res.wonReps.push(rep)}
                else if( cond1 && rep.players[1].result=="Win" ) {res.win++;res.wonReps.push(rep)}
                else {res.wint++;res.wontReps.push(rep)}
            }

        });
        result[opps[vs]]=res
    }
    return result 
}


export default {
    divByZero,
    generateStats,
}

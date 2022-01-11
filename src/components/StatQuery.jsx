/* eslint-disable no-loop-func */
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';

import './StatQuery.css'
import { Button, Modal, Table, TableHead, TableRow, TableCell, Paper } from '@material-ui/core';
import RepMedia from './RepMedia';
import { FixedSizeList } from 'react-window';
/*
    A queryk formátuma:
    -race * required
    -type
    -unit
    -count
    -map
 */

const buttonStyle={
    fontFamily:"Verdana, Geneva, sans-serif",
}

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

function generateStats(query,dataSet){
    const opps=["All","Zerg","Terran","Protoss"]
    const result={}
    for(var vs in opps){
        var res={sum:0,match:0,presenceReps:[],sumw:0,win:0,wonReps:[],sumt:0,wint:0,wontReps:[]}
        dataSet.forEach(rep => {
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

export default function StatQuery({query,dataSet}) {
    const [stats,setStats]=useState()

    const [repsModal,setRepsModal]=useState(false)
    const [reps,setReps]=useState([])

    const openReps=repList=>{
        setReps(repList)
        setRepsModal(true)
    }

    useEffect(()=>{
        setStats(generateStats(query,dataSet))
    },[query,dataSet])
    console.log(dataSet)
    if(!stats) return null
    return (<Paper style={{padding:5,margin:5}}>
        <h3>
            {query.race} winrates
            {query.map?` on ${query.map}`:null}
            {query.exPlayers?" excluding the Top 4":null}
            {query.type=="unit"?` when going for ${query.count} ${query.unit} or more`:null}
            {query.type=="building"?` when getting ${query.count} ${query.building} or more`:null}
            {query.type=="upgrade"?` when ${query.upgrade} gets researched`:null}
            {query.type=="workerlost"?` while losing ${query.count}+ workers before 7:00`:null}
        </h3>
        <table>
            <thead><tr>
                <td>vs</td>
                {query.type!="none"?<td>Presence</td>:null}
                <td>Winrate {query.type!="none"?"with":null}</td>
                {query.type!="none"?<td>Winrate without</td>:null}
            </tr></thead>
            <tbody>
        {Object.keys(stats).map(mu=>{
            const smu=stats[mu]
            const presence=divByZero(smu.match*100,smu.sum)
            const winrate=divByZero(smu.win*100,smu.sumw)
            const withoutrate=divByZero(smu.wint*100,smu.sumt)
            return (<tr>
                <td>vs {mu}</td>
                {query.type!="none"?<td><Button style={buttonStyle} onClick={()=>openReps(smu.presenceReps)}><b>{presence}%</b> [{smu.match}/{smu.sum}]</Button></td>:null}
                <td><Button style={buttonStyle} onClick={()=>openReps(smu.wonReps)}><b>{winrate}%</b> [{smu.win}/{smu.sumw}]</Button></td>
                {query.type!="none"?<td><Button style={buttonStyle} onClick={()=>openReps(smu.wontReps)}><b>{withoutrate}%</b> [{smu.wint}/{smu.sumt}]</Button></td>:null}
        </tr>)})}
        </tbody></table>
        <Modal
            open={repsModal}
            onClose={()=>setRepsModal(false)}
            >
            <div className="replaysModal">
                <Table size="small" padding="default" style={{tableLayout:"fixed"}}>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{width:100}}>Név</TableCell>
                            <TableCell style={{width:60}}>Eredmény</TableCell>
                            <TableCell style={{width:250}}>Épületek</TableCell>
                            <TableCell style={{width:250}}>Egységek</TableCell>
                            <TableCell style={{width:250}}>Veszteségek 7:00 előtt</TableCell>
                        </TableRow>
                    </TableHead>
                    </Table>
                <FixedSizeList
                    height={550}
                    itemCount={reps.length}
                    itemSize={150}
                    >
                        {({index,style})=>(
                            <div style={style}>
                                <RepMedia rep={reps[index]}/>
                            </div>
                        )}
                    </FixedSizeList>
            </div>
            </Modal>
        </Paper>)
}
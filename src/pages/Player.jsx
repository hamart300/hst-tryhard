import { Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import RepMedia from '../components/RepMedia'
import UnitIcon from '../components/UnitIcon'
import "./Player.css"

function formatc({s,w,l}) {
    if(s==0) return null
    const wr=Math.floor(w*100/s)
    let color="#aa0000"
    if(wr>35) color="#993300"
    if(wr>45) color="#666600"
    if(wr>55) color="#339900"
    if(wr>65) color="#00aa00"
    return <>
        <span style={{color}}>{wr}% ({w}-{l})</span>
    </>
}

function formattime(time) {
    return ""+Math.floor(time/60)+":"+Math.floor(time%60/10)+Math.floor(time%10)
}

function formatp(a,b=1){
    return ""+Math.floor(a*100/b)+"%"
}

function formati(i){
    return Math.floor(i*100)/100
}


export default function Player({reps,lists,players}){
    const {playerid}=useParams()
    const [player,setPlayer]=useState(null)
    useEffect(()=>{
        console.log("Player!",playerid,players[playerid])
        setPlayer(players[playerid])
    },[players,playerid])
    if(!player) return null
    return <>
    <div style={{paddingLeft:"50px"}}>
        <Grid container>
            <Grid className="gridder" style={{padding:"30px",width:"40%"}}>
            <h2>{player.name}</h2>
            <h4>{player.race}, {player.w}-{player.l}</h4>
            <table><thead>
                <tr>
                    <td></td><td>°</td><td>W</td><td>L</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Meccs hossz</td>
                    <td>{formattime(player.length)}</td><td>{player.w?formattime(player.lengthw):""}</td><td>{player.l?formattime(player.lengthl):""}</td>
                </tr>
                <tr>
                    <td>Hatékonyság</td>
                    <td>{formatp(player.efficiency)}</td><td>{player.w?formatp(player.efficiencyw):""}</td><td>{player.l?formatp(player.efficiencyl):""}</td>
                </tr>
                <tr>
                    <td>Halott dolgozók</td>
                    <td>{formati(player.workerloss)}</td><td>{player.w?formati(player.workerlossw):""}</td><td>{player.l?formati(player.workerlossl):""}</td>
                </tr>
            </tbody></table><br/>
            <center>
                Kedvenc egységek (összesen eddig {player.count} meccsen):<br/><br/>
                {player.unit_matrix.filter(u=>(u.count>0)).map(unit=><>
                <UnitIcon unit={unit.name} num={unit.count} timing={`avg ${Math.floor(unit.count/player.count)}/map`}/>
                &nbsp;
                </>)}
            </center>
            </Grid>
            <Grid className="gridder"  style={{width:"45%"}}>
                <h2>Matchupok:</h2>
                <table><thead>
                    <tr>
                        <td>Map</td>
                        <td>vs Zerg</td>
                        <td>vs Terran</td>
                        <td>vs Protoss</td>
                    </tr>
                </thead><tbody>
                    {player.matchup_matrix.map(ms=><tr>
                        <td>{ms.mapName}</td>
                        <td>{formatc(ms.Zerg)}</td>
                        <td>{formatc(ms.Terran)}</td>
                        <td>{formatc(ms.Protoss)}</td>
                    </tr>)}
                </tbody></table>
            </Grid>
            <Grid className="gridder">

                <div style={{ width:"80vw"}}>
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
                {reps.filter(r=>r.players.map(rr=>rr.name).includes(player.name)).sort((a,b)=>(a.header.date>b.header.date?-1:1)).map(rep=>{
                const repPrep={...rep}
                const playerid=rep.players[0].name==player.name?0:1
                repPrep.header={...repPrep.header}
                repPrep.header.result=rep.players[playerid].result
                repPrep.header.type="Ladder"
                return <RepMedia rep={repPrep}/>
                })}
                </div>
            </Grid>
        </Grid>
    </div>
    </>
}
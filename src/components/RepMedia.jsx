import React from 'react'
import { Avatar, Card, CardHeader, CardContent, Table, TableBody, TableRow, TableCell, TableHead, IconButton, Tooltip } from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import VideocamIcon from '@material-ui/icons/Videocam';
import opn from 'opn'

import UnitIcon from './UnitIcon'

import './RepMedia.css'

function time(sec) {
    return(""+Math.floor(sec/60)+":"+Math.floor(sec%60/10)+sec%10)
}

export default function RepMedia({rep,addPage}){
    if(!rep) return <div>Error</div>
    let avStyle={}
    switch(rep.header.type) {
        case "Ladder":
            avStyle={backgroundColor:rep.header.result==="Win"?"green":"red"}
            break;
        case "Practice":
            avStyle={backgroundColor:"orange"}
            break;
        case "Custom":
            avStyle={backgroundColor:"blue"}
            break;
        case "Other":
        default:
            avStyle={backgroundColor:"grey"}
            break;

    }
    return( <div className="repcard">
     <Card>
      <CardHeader 
        avatar={<Avatar variant="rounded" style={avStyle}>{rep.race[0][0]+"v"+rep.race[1][0]}</Avatar>}
        title={rep.header.file}
        subheader={rep.header.length+" "+rep.header.map}
        action={<>
            {/*}
            <Tooltip title="Watch replay">
                <a href={rep.header.file}><IconButton><VideocamIcon/></IconButton></a>
            </Tooltip>
        */}
            </>}
        style={{paddingTop:2,paddingBottom:2}}
        />
      <CardContent style={{paddingTop:0,paddingBottom:0}}>
       <Table size="small" padding="default" style={{tableLayout:"fixed"}}>
        <TableBody>
         {rep.players.map((player,ind)=>(
          <TableRow>
           <TableCell className="nowrapstyle" style={{width:"100px"}}>{player.name}</TableCell>
           <TableCell className="nowrapstyle" style={{width:60}}>{player.result}</TableCell>
           <TableCell className="nowrapstyle" style={{width:"250px"}}>{rep.buildings[ind].map(unit=><UnitIcon unit={unit.name} timing={time(unit.timing)} num={unit.count} />)}</TableCell>
           <TableCell className="nowrapstyle" style={{width:250}}>{rep.units[ind].map(unit=><UnitIcon unit={unit.name} timing={time(unit.timing)} num={unit.count} />)}</TableCell>
           <TableCell className="nowrapstyle" style={{width:250}}>{Object.keys(rep.killed_early_units[ind]).map(unit=><UnitIcon unit={unit} num={rep.killed_early_units[ind][unit]} />)}</TableCell>
          </TableRow>
         ))}
        </TableBody>
       </Table>
      </CardContent>
     </Card>
    </div>)
}
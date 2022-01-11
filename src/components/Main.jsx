import React,{useState,useEffect} from 'react'
import {Table, TableHead, TableCell, TableBody, TableRow, Paper, Select, Input, Button, Checkbox} from '@material-ui/core'

import './Main.css'
import RepMedia from './RepMedia'
import StatQuery from './StatQuery'

var uniqueid=1
const getUniqueId=()=>uniqueid++

export default function Main() {
    const [reps,setReps]=useState([])
    const [queries,setQueries]=useState([{id:0,race:"Protoss",type:"unit",unit:"Stalker",count:6}])
    
    // the form state
    const [race,setRace]=useState("Terran")
    const [unit,setUnit]=useState("")
    const [building,setBuilding]=useState()
    const [upgrade,setUpgrade]=useState()
    const [count,setCount]=useState(1)
    const [map,setMap]=useState("")
    const [exPlayers,setExPlayers]=useState(false)
    // the form lists
    const [unitsAvailable,setUnitsAvailable]=useState({})
    const [upgradesAvailable,setUpgradesAvailable]=useState({})
    const [buildingsAvailable,setBuildingsAvailable]=useState({})
    const racesAvailable=["Terran","Zerg","Protoss"]
    const [mapsAvailable,setMapsAvailable]=useState([])
    /*const mapsAvailable=["","Deathaura","Ever Dream","Eternal Empire","Ice and Chrome","Golden Wall","Pillars of Gold","Submarine"]
    */
    const addNewQuery=type=>{
        const top4=["Serral","Solar","INnoVation","Clem"]
        if(type=="unit")
            setQueries( [ { id:getUniqueId(),race,type,unit,count,map,exPlayers:exPlayers?top4:false} ,...queries] )
        if(type=="building")
            setQueries( [ { id:getUniqueId(),race,type,building,count,map,exPlayers:exPlayers?top4:false} ,...queries] )
        if(type=="upgrade")
            setQueries( [ { id:getUniqueId(),race,type,upgrade,map,exPlayers:exPlayers?top4:false} ,...queries] )
        if(type=="none")
            setQueries( [ { id:getUniqueId(),race,type,map,exPlayers:exPlayers?top4:false} ,...queries] )
        if(type=="workerlost")
            setQueries( [ { id:getUniqueId(),race,type,count,map,exPlayers:exPlayers?top4:false} ,...queries] )
    }

    useEffect(()=>{
        fetch("reps.json").then(response=>response.json()).then(newReps=>{
        setReps(newReps)
        const newMapsAvailable=[]
        newReps.forEach(rep=>{
            console.log("Chek map for rep:",rep)
            if(!newMapsAvailable.includes(rep.header.map))
                newMapsAvailable.push(rep.header.map)
        })
        setMapsAvailable(newMapsAvailable)
        const newUnitsAvailable={"Zerg":[],"Protoss":[],"Terran":[]}
        newReps.forEach(rep=>{
            console.log("Chek units for rep:",rep)
            for(var i=0;i<1;i++) {
                for(var j=0;j<rep.units[i].length;j++) {
                    if(!newUnitsAvailable[rep.race[i]].includes(rep.units[i][j].name))
                        newUnitsAvailable[rep.race[i]].push(rep.units[i][j].name)
                }
            }
        })
        setUnitsAvailable(newUnitsAvailable)
        const newBuildingsAvailable={"Zerg":[],"Protoss":[],"Terran":[]}
        newReps.forEach(rep=>{
            for(var i=0;i<1;i++) {
                for(var j=0;j<rep.buildings[i].length;j++) {
                    if(!newBuildingsAvailable[rep.race[i]].includes(rep.buildings[i][j].name))
                        newBuildingsAvailable[rep.race[i]].push(rep.buildings[i][j].name)
                }
            }
        })
        setBuildingsAvailable(newBuildingsAvailable)
        const newUpgradesAvailable={"Zerg":[],"Protoss":[],"Terran":[]}
        newReps.forEach(rep=>{
            for(var i=0;i<1;i++) {
                for(var j=0;j<rep.upgrades[i].length;j++) {
                    if(!newUpgradesAvailable[rep.race[i]].includes(rep.upgrades[i][j].name))
                        newUpgradesAvailable[rep.race[i]].push(rep.upgrades[i][j].name)
                }
            }
        })
        setUpgradesAvailable(newUpgradesAvailable)
    })
    },[])

    return (<div className="MainPage">
        <h2>STATS for HST4</h2>
        <i>Note: In mirror matchups, presence counts if at least one player goes for the condition.</i><br/>
        <i>BUT! for counting winrates, the matches where both players or neither of the players go for it are ignored.</i><br/>
        <i>Note 2: The unit count stands for how many the players got during the game. Includes lost units, or drones building something.</i><br/><br/>
        <Paper>
            Add new query:<br/>
            <Select
                native
                value={race}
                onChange={e=>setRace(e.target.value)}
                >
                {racesAvailable.map(raceOption=><option key={raceOption} value={raceOption}>{raceOption}</option>)}
                </Select>
            winrates for players (only on the map 
            <Select 
                native
                value={map}
                onChange={e=>setMap(e.target.value)}
                >
                <option value="" />
                {mapsAvailable.map(mapOption=><option key={mapOption} value={mapOption}>{mapOption}</option>)}
                </Select>
            ) ( 
            <Checkbox
                checked={exPlayers}
                onChange={e=>setExPlayers(e.target.checked)}
                />
             exclude games played by Top 4 - Serral,Solar,Innovation,Clem  
            )<br/>
            - just in general <Button variant="contained" onClick={()=>addNewQuery("none")}>GO!</Button> <br/>
            - getting: <Input value={count} onChange={e=>setCount(e.target.value)} /> or more 
            <Select
                native
                value={unit}
                onChange={e=>setUnit(e.target.value)}
                >
                <option value="" />
                {unitsAvailable[race]?unitsAvailable[race].map(unitOption=><option key={unitOption} value={unitOption}>{unitOption}</option>):null}
                </Select>
            <Button variant="contained" onClick={()=>addNewQuery("unit")}>GO!</Button><br/>

            - building: <Input value={count} onChange={e=>setCount(e.target.value)} /> or more 
            <Select
                native
                value={building}
                onChange={e=>setBuilding(e.target.value)}
                >
                <option value="" />
                {buildingsAvailable[race]?buildingsAvailable[race].map(unitOption=><option key={unitOption} value={unitOption}>{unitOption}</option>):null}
                </Select>
            <Button variant="contained" onClick={()=>addNewQuery("building")}>GO!</Button><br/>
            - researching: <Select
                native
                value={upgrade}
                onChange={e=>setUpgrade(e.target.value)}
                >
                <option value="" />
                {upgradesAvailable[race]?upgradesAvailable[race].map(unitOption=><option key={unitOption} value={unitOption}>{unitOption}</option>):null}
                </Select>
            <Button variant="contained" onClick={()=>addNewQuery("upgrade")}>GO!</Button><br/>
            - losing at least: <Input value={count} onChange={e=>setCount(e.target.value)} /> workers at the first 7 minutes 
            <Button variant="contained" onClick={()=>addNewQuery("workerlost")}>GO!</Button><br/>
        </Paper>
        {queries.map(query=><React.Fragment key={query.id} ><StatQuery 
            query={query}
            dataSet={reps}
            /></React.Fragment>)}
        {/*reps.map(rep=><RepMedia rep={rep} />)*/}
    </div>)
}
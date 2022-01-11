import React from 'react'
import Main from '../components/Main'
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import Header from '../components/Header'
import Balance from '../pages/Balance'
import { useState } from 'react'
import { useEffect } from 'react'
import Players from '../pages/Players'
import Player from '../pages/Player'

export default function App(){
  const [reps,setReps]=useState([])
  const [players,setPlayers]=useState([])
  const [lists,setLists]=useState({
    maps:[],
    races:["Terran","Zerg","Protoss"],
    units:[],
    buildings:[],
    upgrades:[],
  })

  useEffect(()=>{
    fetch("/reps.json").then(response=>response.json()).then(newRepsUnfiltered=>{
      const newReps=newRepsUnfiltered.filter(r=>(
          r!==0 &&
          !(r.header.length.split(":")[0]==="0" && parseInt(r.header.length.split(":")[1])<20) &&
          !(r.players.map(p=>p.name).join(' ').includes("A.I."))
          ))
      console.log("Replays fetched",newReps)

      setReps(newReps)
      const newMapsAvailable=[]
      newReps.forEach(rep=>{
          if(!newMapsAvailable.includes(rep.header.map))
              newMapsAvailable.push(rep.header.map)
      })
      const newUnitsAvailable={"Zerg":[],"Protoss":[],"Terran":[]}
      newReps.forEach(rep=>{
          for(var i=0;i<1;i++) {
              for(var j=0;j<rep.units[i].length;j++) {
                  if(!newUnitsAvailable[rep.race[i]].includes(rep.units[i][j].name))
                      newUnitsAvailable[rep.race[i]].push(rep.units[i][j].name)
              }
          }
      })
      const newBuildingsAvailable={"Zerg":[],"Protoss":[],"Terran":[]}
      newReps.forEach(rep=>{
          for(var i=0;i<1;i++) {
              for(var j=0;j<rep.buildings[i].length;j++) {
                  if(!newBuildingsAvailable[rep.race[i]].includes(rep.buildings[i][j].name))
                      newBuildingsAvailable[rep.race[i]].push(rep.buildings[i][j].name)
              }
          }
      })
      const newUpgradesAvailable={"Zerg":[],"Protoss":[],"Terran":[]}
      newReps.forEach(rep=>{
          for(var i=0;i<1;i++) {
              for(var j=0;j<rep.upgrades[i].length;j++) {
                  if(!newUpgradesAvailable[rep.race[i]].includes(rep.upgrades[i][j].name))
                      newUpgradesAvailable[rep.race[i]].push(rep.upgrades[i][j].name)
              }
          }
      })
      // I want: replay number, general winrate (w-l), avg efficiency (wl), avg game length(w-l), map/matchup matrix, replays
      // worker losses(w-l), fav unit? so fav unit matrix for it (maybe i can just sum up every unit made)
      const newPlayers=[]
      newReps.forEach(rep=>{
        for(var i=0;i<2;i++) {
            if(!newPlayers.map(p=>p.name).includes(rep.players[i].name))
                newPlayers.push({
                    name:rep.players[i].name,
                    race:[rep.race[i]],
                    count:0,
                    w:0,
                    l:0,
                    efficiency:0,
                    efficiency_perfect:0,
                    efficiency_perfectl:0,
                    efficiencyw:0,
                    efficiencyl:0,
                    length:0,
                    lengthw:0,
                    lengthl:0,
                    workerloss:0,
                    workerlossw:0,
                    workerlossl:0,
                    matchup_matrix:newMapsAvailable.map(mapName=>({
                        mapName,
                        "Zerg":{s:0,w:0,l:0},
                        "Terran":{s:0,w:0,l:0},
                        "Protoss":{s:0,w:0,l:0},
                    })),
                    unit_matrix:newUnitsAvailable[rep.race[i]].map(unit=>({
                        name:unit,
                        count:0
                    })),
                    allunitcount:0,
                })
            // here comes the data collection
            const win=rep.players[i].result==="Win"
            // This is a reference if things are right
            const pl=newPlayers.find(player=>player.name==rep.players[i].name)
            if(!pl.race.includes(rep.race[i])){
                pl.race.push(rep.race[i])
                newUnitsAvailable[rep.race[i]].forEach(unit=>{
                    pl.unit_matrix.push({
                        name:unit,
                        count:0,
                    })
                })
            }


            pl.count++
            win?pl.w++:pl.l++

            const opp=(i===0)?1:0
            let effic=rep.losses[opp]/rep.losses[i]
            if(rep.losses[i]===0||effic>10) {
                
                if(!win) pl.efficiency_perfectl++
                else pl.efficiency_perfect++
                } else {
                pl.efficiency=(pl.efficiency*(pl.count-pl.efficiency_perfect-1)+effic)/(pl.count-pl.efficiency_perfect)
                win?pl.efficiencyw=(pl.efficiencyw*(pl.w-pl.efficiency_perfect-1)+effic)/(pl.w-pl.efficiency_perfect)
                :pl.efficiencyl=(pl.efficiencyl*(pl.l-pl.efficiency_perfectl-1)+effic)/(pl.l-pl.efficiency_perfectl)
    
            }

            const gamelength=parseInt(rep.header.length.split(':')[0])*60+parseInt(rep.header.length.split(':')[1])
            //console.log("Gamelength",gamelength,rep.header.length)
            pl.length=(pl.length*(pl.count-1)+gamelength)/pl.count
            win?pl.lengthw=(pl.lengthw*(pl.w-1)+gamelength)/pl.w
            :pl.lengthl=(pl.lengthl*(pl.l-1)+gamelength)/pl.l

            let workerlosses=rep.killed_early_units[i][rep.units[i][0].name]
            if(workerlosses===undefined) workerlosses=0
            pl.workerloss=(pl.workerloss*(pl.count-1)+workerlosses)/pl.count
            win?pl.workerlossw=(pl.workerlossw*(pl.w-1)+workerlosses)/pl.w
            :pl.workerlossl=(pl.workerlossl*(pl.l-1)+workerlosses)/pl.l

            const um=pl.matchup_matrix.find(sv=>sv.mapName===rep.header.map)[i===0?rep.race[1]:rep.race[0]]
            um.s++
            win?um.w++
            :um.l++

            rep.units[i].forEach(unit=>{
                //console.log("UNITCOUNT",rep.race[i],unit,pl.unit_matrix,pl)
                pl.unit_matrix.find(sv=>sv.name===unit.name).count+=unit.count
                pl.allunitcount+=unit.count
            })
      }})
      console.log("Player stats:",newPlayers)
      setPlayers(newPlayers)
      setLists({
        maps:newMapsAvailable,
        races:["Terran","Zerg","Protoss"],
        units:newUnitsAvailable,
        buildings:newBuildingsAvailable,
        upgrades:newUpgradesAvailable,
      })
  })
},[])

  return (
        <>
          <BrowserRouter>
              <Header/>
              <Routes>
              
              <Route path="/" exact element={<Navigate to="/players"/>}></Route>
              <Route path="/balance" exact element={<Balance reps={reps} lists={lists}/>}></Route>
              <Route path="/balance/:race" exact element={<Balance reps={reps} lists={lists}/>}></Route>
              <Route path="/players" exact element={<Players reps={reps} lists={lists} players={players}/>}></Route>
              <Route path="/player/:playerid" element={<Player reps={reps} lists={lists} players={players}/>}></Route>
              </Routes>
          </BrowserRouter>
        </>
    )
}
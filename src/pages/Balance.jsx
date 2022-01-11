import { Button, Input, Modal, Select, Table, TableCell, TableHead, TableRow } from '@material-ui/core'
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FixedSizeList } from 'react-window'
import RepMedia from '../components/RepMedia'
import functions from '../js/functions'

function QuerySetup({lists,race,onQuery}){
    const [unit,setUnit]=useState("")
    const [building,setBuilding]=useState()
    const [upgrade,setUpgrade]=useState()
    const [count,setCount]=useState(1)
    const addNewQuery=type=>{
        if(type=="unit")
            onQuery( { race,type,unit,count,}   )
        if(type=="building")
            onQuery( { race,type,building,count,}   )
        if(type=="upgrade")
            onQuery( { race,type,upgrade,}   )
        if(type=="none")
            onQuery( { race,type,}   )
        if(type=="workerlost")
            onQuery( { race,type,count,}   )
    }
    return <>
            <h3>Feltételes keresés!</h3>
            Mutasd a winrateket ha,<br/>
            - veszel: <Input value={count} width={5} onChange={e=>setCount(e.target.value)} /> &nbsp;
            <Select
                native
                value={unit}
                onChange={e=>setUnit(e.target.value)}
                >
                <option value="" />
                {lists.units[race]?lists.units[race].map(unitOption=><option key={unitOption} value={unitOption}>{unitOption}</option>):null}
                </Select>
             -t <Button variant="contained" onClick={()=>addNewQuery("unit")}>GO!</Button><br/>

            - építesz: <Input value={count} onChange={e=>setCount(e.target.value)} />  &nbsp; 
            <Select
                native
                value={building}
                onChange={e=>setBuilding(e.target.value)}
                >
                <option value="" />
                {lists.buildings[race]?lists.buildings[race].map(unitOption=><option key={unitOption} value={unitOption}>{unitOption}</option>):null}
                </Select>
                -t <Button variant="contained" onClick={()=>addNewQuery("building")}>GO!</Button><br/>
            - kifejleszted: <Select
                native
                value={upgrade}
                onChange={e=>setUpgrade(e.target.value)}
                >
                <option value="" />
                {lists.upgrades[race]?lists.upgrades[race].map(unitOption=><option key={unitOption} value={unitOption}>{unitOption}</option>):null}
                </Select>
                -t <Button variant="contained" onClick={()=>addNewQuery("upgrade")}>GO!</Button><br/>
            - vesztesz legalább: <Input value={count} onChange={e=>setCount(e.target.value)} /> dolgozót az első 7 percben 
            -t <Button variant="contained" onClick={()=>addNewQuery("workerlost")}>GO!</Button><br/>
    </>

}

function QueryReport({stats,qstats,query,onSpecQuery,onToMaps,onReps}){
    return <>
            <h2>
            {query.type=="unit"?` Ha veszel legalább ${query.count} ${query.unit} -t`:null}
            {query.type=="building"?` Ha veszel legalább ${query.count} ${query.building} -t`:null}
            {query.type=="upgrade"?` Ha kifejleszted a ${query.upgrade} -t`:null}
            {query.type=="workerlost"?` Ha elvesztesz legalább ${query.count}dolgozót 7:00 előtt`:null}
            </h2>
             <table>
                <thead>
                    <tr>
                        <td></td>
                        <td>Általános winrate</td>
                        <td>Ha igen</td>
                        <td>Ha nem</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                {[...Object.keys(stats),query.race].map(mu=>{
                const smu=qstats[mu]
                const sgu=stats[mu]
                const generalwr=sgu?functions.divByZero(sgu.win*100,sgu.sumw):null
                const winrate=functions.divByZero(smu.win*100,smu.sumw)
                const withoutrate=functions.divByZero(smu.wint*100,smu.sumt)
                return <tr>
                        <td>vs{mu}</td>
                        {sgu?<td>{generalwr}% ({sgu.win}-{sgu.sumw-sgu.win})</td>:<td></td>}
                        <td>{winrate}% ({smu.win}-{smu.sumw-smu.win})</td>
                        <td>{withoutrate}% ({smu.wint}-{smu.sumt-smu.wint})</td>
                        <td><button onClick={()=>onReps(smu.presenceReps)}>Replayek</button></td>
                    </tr>
                })}
                </tbody>
            </table>
            <Button variant="outlined" onClick={()=>onSpecQuery()}>Új feltétel</Button>
            <Button variant="outlined" onClick={()=>onToMaps()}>Vissza a mapokhoz</Button>
    </>
}

function GeneralReport({stats,statsOnMaps,onSpecQuery,onReps}){
    return <>
             <table>
                <thead>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                {Object.keys(stats).map(mu=>{
                const smu=stats[mu]
                const presence=functions.divByZero(smu.match*100,smu.sum)
                const winrate=functions.divByZero(smu.win*100,smu.sumw)
                const withoutrate=functions.divByZero(smu.wint*100,smu.sumt)
                return <tr>
                        <td>vs{mu}</td>
                        <td>{winrate}% ({smu.win}-{smu.sumw-smu.win})</td>
                        <td  style={{borderBottom:"1px solid"}}>
                            <table><tbody>
                            {statsOnMaps[mu].map(mapstat=>{
                                const smum=mapstat.stats
                                const presencem=functions.divByZero(smum.match*100,smum.sum)
                                const winratem=functions.divByZero(smum.win*100,smum.sumw)
                                const withoutratem=functions.divByZero(smum.wint*100,smum.sumt)
                                return <tr>
                                    <td>{mapstat.mapName}</td>
                                    <td>{winratem}%</td>
                                    <td> ({smum.win}-{smum.sumw-smum.win})</td>
                                    <td><button onClick={()=>onReps(smum.presenceReps)}>Replayek</button></td>
                                </tr>
                            })}
                            </tbody></table>
                        </td>
                    </tr>
                })}
                    
                </tbody>
            </table>
            Klikkelj ide további statokhoz-&gt;<Button variant="outlined" onClick={()=>onSpecQuery()}>Feltételes winratek</Button>
    </>
}

export default function Balance({reps,lists}){
    const navigate=useNavigate()
    const {race}=useParams()
    const [stats,setStats]=useState([])
    const [statsOnMaps,setStatsOnMaps]=useState([])
    const [specialQuery,setSpecialQuery]=useState(null)
    const [specialResults,setSpecialResults]=useState({})
    const [repsModal,setRepsModal]=useState(false)
    const [freps,setFreps]=useState([])

    useEffect(()=>{
        console.log("Reps:",reps)
        const opps=["Terran","Zerg","Protoss"].filter(f=>f!=race)
        const newStats=functions.generateStats({
            race,
            type:"none",
        },
        reps,
        opps
        )
        console.log("New stats",newStats)
        setStats(newStats)
        const newStatsOnMaps={}
        const sv=lists.maps.map(mapName=>({
            mapName,
            stats:functions.generateStats({
            race,
            map:mapName,
            type:"none",
            },
            reps,
            opps
            )}))
        opps.forEach(vs=>{
            const mr=[]
            sv.forEach(mapstat=>{
                mr.push({
                    mapName:mapstat.mapName,
                    stats:mapstat.stats[vs],
                })

            })
            newStatsOnMaps[vs]=mr.sort((a,b)=>{
                const anum=a.stats.sumw==0?-100:a.stats.win/a.stats.sumw
                const bnum=b.stats.sumw==0?-100:b.stats.win/b.stats.sumw
                return bnum-anum
            })
        })
        setStatsOnMaps(newStatsOnMaps)
        console.log("TestQuery",functions.generateStats({
            race,
            map:"Pride of Altaris LE",
            type:"none",
        },reps,opps))
    },[race,reps,lists])

    return <>
        <center>
        <Button variant="outlined" onClick={()=>{navigate("/balance/Terran");setSpecialQuery(null)}}>Terran</Button>
        <Button variant="outlined" onClick={()=>{navigate("/balance/Zerg");setSpecialQuery(null)}}>Zerg</Button>
        <Button variant="outlined" onClick={()=>{navigate("/balance/Protoss");setSpecialQuery(null)}}>Protoss</Button>
        <br/>
        {race?<>
            <h1>{race} balansz statisztikák</h1><br/>
                {specialQuery?
                specialQuery==="new"?
                <QuerySetup lists={lists} race={race} onQuery={query=>{
                    const newQueryResults=functions.generateStats(query,reps,lists.races)
                    setSpecialResults(newQueryResults)
                    setSpecialQuery(query)
                }}/>:
                <QueryReport stats={stats} query={specialQuery} qstats={specialResults}
                    onSpecQuery={()=>setSpecialQuery("new")}
                    onToMaps={()=>setSpecialQuery(null)}
                    onReps={shownreps=>{
                        setRepsModal(true)
                        setFreps(shownreps)
                    }} />
                :<GeneralReport stats={stats} statsOnMaps={statsOnMaps} onSpecQuery={()=>setSpecialQuery("new")} onReps={shownreps=>{
                    setRepsModal(true)
                    setFreps(shownreps)
                }} />
                }
        </>
       :<><br/>Válaszd ki a fajod</>}
    </center>
    
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
                    itemCount={freps.length}
                    itemSize={150}
                    >
                        {({index,style})=>(
                            <div style={style}>
                                <RepMedia rep={freps[index]}/>
                            </div>
                        )}
                    </FixedSizeList>
            </div>
            </Modal>
    </>
}
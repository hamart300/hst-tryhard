import { Button, Toolbar } from '@material-ui/core'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header(){
    const navigate=useNavigate()
    return <>
        <Toolbar>
            <p style={{flex:1}}><b>HST statok</b>&nbsp;&nbsp;&nbsp;
            <Button variant="outlined" onClick={()=>navigate("/players")}>Játékosok</Button>&nbsp;
            <Button variant="outlined" onClick={()=>navigate("/balance")}>Mi az IMBA</Button>&nbsp;
            updated:2022.01.11
            </p>
            <Button variant="outlined" href="https://drive.google.com/drive/folders/1aDl2tEbFWgINxLRhI-RMWVXhuxDUaJew">HST Repek</Button>&nbsp;
            <Button variant="outlined" href="https://docs.google.com/spreadsheets/d/1L8X39sqMvp6rzvPgUANn2dp1NuFq0uH-W5dRW47YPGE/edit">HST Doksi</Button>&nbsp;
            <Button variant="outlined" href="https://www.youtube.com/channel/UC6iw48JB9qGlDegDQ6nDRig/videos">HST YT</Button>&nbsp;&nbsp;
            made by Fedak
        </Toolbar>
    </>
}
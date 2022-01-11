from .moduleBase import *

def addFormattedEvent(pdcOut,name,evt,timing):
    uname=resolve(name)
    typ="?"
    if(uname in BUILDINGS):
        typ="bld"
    else:
        typ="unit"
    if(uname in ALL_VALID):
        pdcOut.append({
            'timing':timing,
            'evt':evt,
            'type':typ,
            'name':uname
            })
        return uname
    return False

class mUnitsTracker(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Units tracker Module"
        self.outName="unit_tracker"
    def _setupPDC(self):
        return []
    def _feed(self,ev,pdc):
        if(ev.name=="UnitInitEvent" or ev.name=="UnitBornEvent"):
            addFormattedEvent(pdc,ev.unit,'new',self.toSec(ev.frame))
        if(ev.name=="UnitDiedEvent"):
            if(ev.killer):
                addFormattedEvent(pdc,ev.unit,'lost',self.toSec(ev.frame))
            else:
                addFormattedEvent(pdc,ev.unit,'removed',self.toSec(ev.frame))

        if(ev.name=="UnitTypeChangeEvent"):
            addFormattedEvent(pdc,ev.original,'removed',self.toSec(ev.frame))
            addFormattedEvent(pdc,ev.unit,'new',self.toSec(ev.frame))

    def _finish(self,pdc):
        return pdc


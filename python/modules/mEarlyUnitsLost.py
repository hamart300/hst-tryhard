from .moduleBase import *
from .utils import Units_counter

class mEarlyUnitsLost(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Early units lost module"
        self.outName="killed_early_units"
    def _setupPDC(self):
        return Units_counter()
    def _feed(self,ev,pdc):
        if(ev.name=="UnitDiedEvent" and self.toSec(ev.frame)<420 and ev.killer):
            uname=resolve(ev.unit)
            if(uname in ALL_VALID):
                pdc.push(uname,-1)
        return
    def _finish(self,pdc):
        return pdc.units


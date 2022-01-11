from .moduleBase import *

class mLossesTracker(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Player final losses tracker Module"
        self.outName="losses"
    def _setupPDC(self):
        return {"losses":0}
    def _feed(self,ev,pdc):
        if(ev.name=="PlayerStatsEvent"):
            pdc['losses']=ev.losses
    def _finish(self,pdc):
        return pdc['losses']


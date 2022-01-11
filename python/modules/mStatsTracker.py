from .moduleBase import *

class mStatsTracker(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Player Stats tracker Module"
        self.outName="player_stats"
    def _setupPDC(self):
        return []
    def _feed(self,ev,pdc):
        if(ev.name=="PlayerStatsEvent"):
            pdc.append({
                'workers':ev.workers,
                'supply':ev.food,
                'totalMined':ev.totalmined,
                'timing':self.toSec(ev.frame)
            })
    def _finish(self,pdc):
        return pdc


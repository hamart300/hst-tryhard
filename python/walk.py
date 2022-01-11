import os
import pprint

valami=[0,1,2]

for root,dirs,files in os.walk("reps"):
    pprint.pprint(root)
    pprint.pprint(dirs)
    pprint.pprint(files)

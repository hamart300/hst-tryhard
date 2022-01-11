import pymongo,os,hashlib,pprint

cli=pymongo.MongoClient("mongodb://localhost:27017/")
        

db=cli['sc-replist']
col=db['reps']
cold=db['dirs']
#col.update_many({},{"$set":{"dir":"/Fedak"}})
col.create_index([("dir",pymongo.ASCENDING),("header.date",pymongo.DESCENDING)],name="Primary_list")
col.create_index([ ('header.mu','text'),('header.type','text'),('header.map','text'),
                   ('players.name','text'),('start_bo.name','text'),('units.name','text'),('header.date','text')])
#col.create_index([("$**",'text')])
pprint.pprint(col.find_one({"$text":{"$search":"ZvP -Immortal"}},{'unit_tracker':0,'player_stats':0}))
#cold.update_one({},{'$set':{'fileNames':[],'fileHashes':[]}})
#cold.update_one({'name':'/testReps'},{'$set':{'path':'reps'}})
#col.delete_many({"dir":"Fedak"})

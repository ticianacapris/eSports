import express from "express";
import { PrismaClient } from "@prisma/client";
import { convertourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
const app = express();
const prisma = new PrismaClient(
   { log: ["query", "info", "warn", "error"] }  
);

app.use(express.json());

app.get("/games", async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
     _count: { 
      select:{
         ads: true,
        }
      }
    }    
  });

  response.json(games);
});

app.post("/games/:id/ads", async (request, response) => {
 const gameId = request.params.id;
  const body:any = request.body;

  const ad = await prisma.ad.create({
    data:  {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,  
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertourStringToMinutes(body.hourStart),
      hourEnd: convertourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,

    },
  })
  return response.status(201).json(ad);


});

app.get("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },

    where: {
      gameId,
    },
    orderBy : { 
      createdAt: "desc"
    }
  });
  return response.json(ads.map((ad) => { 
    return {
      ...ad,
      weekDays: ad.weekDays.split(","),
    };
  }));
});

app.get("/ads/:id/discord", async (request, response) => {
  const adId = await request.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    select: { 
      discord: true,
    },

    where: {
      id: adId,
    },
  });

  if (!ad) {
    return response.status(404).json({ message: "Ad not found" });
  }

  return response.json({ 
    discord: ad.discord,
  });
});


app.listen(3333);

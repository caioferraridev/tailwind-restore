import {
    ListChecks,
    FolderOpen,
    CalendarDays,
    Briefcase
} from "lucide-react";

type Props = {
    demands:number;
    files:number;
    events:number;
    services:number;
};

export default function PortalStats({
    demands,
    files,
    events,
    services,
}:Props){

    return(

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <Stat
                title="Demandas"
                value={demands}
                icon={<ListChecks size={24}/>}
                color="text-blue-600"
            />

            <Stat
                title="Arquivos"
                value={files}
                icon={<FolderOpen size={24}/>}
                color="text-green-600"
            />

            <Stat
                title="Eventos"
                value={events}
                icon={<CalendarDays size={24}/>}
                color="text-orange-600"
            />

            <Stat
                title="Serviços"
                value={services}
                icon={<Briefcase size={24}/>}
                color="text-purple-600"
            />

        </div>

    );

}

function Stat({
    title,
    value,
    icon,
    color
}:{
    title:string;
    value:number;
    icon:React.ReactNode;
    color:string;
}){

    return(

        <div className="
            rounded-2xl
            border
            bg-white
            p-6
            shadow-sm
            hover:shadow-lg
            transition-all
            duration-300
        ">

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-sm text-muted-foreground">

                        {title}

                    </p>

                    <h2 className="text-4xl font-bold mt-3">

                        {value}

                    </h2>

                </div>

                <div className={`${color}`}>

                    {icon}

                </div>

            </div>

        </div>

    );

}
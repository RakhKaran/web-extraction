import fs from "fs";
import path from "path";
import { Scheduler } from "../../models";

export class AirflowDagService {
    async createDagFile(scheduler: Scheduler, designation: string) {
        const projectRoot = path.resolve(__dirname, "../../../");
        const dagsPath = path.join(projectRoot, "dags");

        console.log("dags path", dagsPath);

        const safeName = scheduler.schedularName.replace(/[^a-zA-Z0-9]/g, "_");
        const safeDesignation = designation
            ? designation.replace(/[^a-zA-Z0-9]/g, "_")
            : "";

        const dagName = safeDesignation
            ? `dag_${safeName}_${safeDesignation}`
            : `dag_${safeName}`;
        const dagFileName = `${dagName}.py`;

        // build task ID
        const taskId = safeDesignation
            ? `task_${safeName}_${safeDesignation}`
            : `task_${safeName}`;

        let scheduleInterval = `"0 1 * * *"`;
        if (scheduler.schedulerType === 1) {
            if (scheduler.intervalType === 1) {
                scheduleInterval = `"0 */${scheduler.interval} * * *"`;
            }
        }

        const dagContent = `
from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2025, 9, 19),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    dag_id='${dagName}',
    default_args=default_args,
    schedule=${scheduleInterval},
    catchup=False,
) as dag:
    task1 = BashOperator(
        task_id='${taskId}',
        bash_command='node /opt/airflow/dist/scripts/run-extraction.js ${scheduler.id}'
    )

    task1
`;

        // Write DAG file
        fs.writeFileSync(path.join(dagsPath, dagFileName), dagContent);

        return dagFileName;
    }
}

import fs from "fs";
import path from "path";
import { Scheduler } from "../../models";

export class AirflowDagService {
    async createDagFile(scheduler: Scheduler, searchField: string) {
        const projectRoot = path.resolve(__dirname, "../../../");
        const dagsPath = path.join(projectRoot, "dags");

        console.log('dags path', dagsPath);
        const safeName = scheduler.schedularName.replace(/[^a-zA-Z0-9]/g, "_");
        const safeDesignation = searchField
            ? searchField.replace(/[^a-zA-Z0-9]/g, "_")
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
from airflow.utils.dates import days_ago
from datetime import timedelta

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': days_ago(1),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    dag_id='${dagName}',
    default_args=default_args,
    schedule_interval=${scheduleInterval},
    catchup=False,
    max_active_runs=1,
) as dag:

    extract_task = BashOperator(
        task_id='${taskId}',
        pool='browser_pool',
        bash_command=\"\"\"
        xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' \\
        node /opt/airflow/dist/scripts/run-extraction.js ${scheduler.id} "${searchField}"
        \"\"\",
    )

    extract_task
`;

        const dagPath = path.join(dagsPath, dagFileName);

        if (fs.existsSync(dagPath)) {
            console.log(`DAG already exists: ${dagFileName}`);
            return dagFileName;
        }

        try {
            await fs.promises.writeFile(
                path.join(dagsPath, dagFileName),
                dagContent
            );
            return dagFileName;
        } catch (err) {
            console.error('Failed to write DAG file', err);
            throw err;
        }

    }
}

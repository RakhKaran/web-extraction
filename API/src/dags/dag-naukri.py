
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
    dag_id='dag-naukri',
    default_args=default_args,
    # schedule="0 */2 * * *",
    schedule=None,
    catchup=False,
) as dag:
    task1 = BashOperator(
        task_id='task_naukri',
        bash_command='"node /opt/airflow/dist/scripts/run-extraction.js 68ccfb0d206e133b98e98a4e"'
    )

    task1

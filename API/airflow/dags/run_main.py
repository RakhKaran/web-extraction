from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

dag = DAG(
    dag_id="run_main_workflow",
    description="Run LB4 Main Service via Node.js",
    start_date=datetime(2023, 1, 1),
    schedule_interval=None,  # manual for now
    catchup=False,
    tags=["lb4", "workflow", "extraction"],
)

run_main = BashOperator(
    task_id="run_main_service",
    bash_command=(
        "node /opt/airflow/dist/scripts/run-main.js"
    ),
    retries=1,
    retry_delay=timedelta(minutes=2),
    execution_timeout=timedelta(minutes=30),
    dag=dag,
)
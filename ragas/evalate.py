import os, json
from langfuse import Langfuse
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper

# import metrics
from ragas.metrics import faithfulness, answer_relevancy
from ragas.metrics.critique import harmfulness

# metrics you chose
metrics = [faithfulness, answer_relevancy, harmfulness]

load_dotenv()

langfuse = Langfuse(
  public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
  secret_key=os.environ["LANGFUSE_SECRET_KEY"],
  host=os.environ["LANGFUSE_BASEURL"],
)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        # datetime -> str
        if type(obj).__name__ == 'datetime':
            return obj.isoformat() # https://docs.python.org/ja/3.7/library/datetime.html#datetime.datetime.isoformat
        # object -> dict
        if isinstance(obj, object) and hasattr(obj, '__dict__'):
            return obj.__dict__
        # dict,str,int,... -> default
        return super().default(obj)


def print_json_dumps(value):
  print(json.dumps(value, cls=CustomJSONEncoder, indent=2, ensure_ascii=False))

from ragas.run_config import RunConfig
from ragas.metrics.base import MetricWithLLM, MetricWithEmbeddings
from random import sample


# util function to init Ragas Metrics
def init_ragas_metrics(metrics, llm, embedding):
    for metric in metrics:
        if isinstance(metric, MetricWithLLM):
            metric.llm = llm
        if isinstance(metric, MetricWithEmbeddings):
            metric.embeddings = embedding
        run_config = RunConfig()
        metric.init(run_config)

def get_traces(name=None, limit=None, user_id=None):
    all_data = []
    page = 1

    while True:
        response = langfuse.client.trace.list(
            name=name, page=page, user_id=user_id
        )
        if not response.data:
            break
        page += 1
        all_data.extend(response.data)
        if limit is not None  and len(all_data) > limit:
            break

    return all_data[:limit] if limit is not None else all_data

def main():

  llm = AzureChatOpenAI()
  emb = AzureOpenAIEmbeddings(
    model='text-embedding-3-large'
  )

  init_ragas_metrics(
      metrics,
      llm=LangchainLLMWrapper(llm),
      embedding=LangchainEmbeddingsWrapper(emb),
  )

  # print_json_dumps(os.environ)

  NUM_TRACES_TO_SAMPLE = 50
  traces = get_traces()
  # traces_sample = sample(traces, NUM_TRACES_TO_SAMPLE)

  # print_json_dumps(traces)

  evaluation_batch = {
    "question": [],
    "contexts": [],
    "answer": [],
    "trace_id": [],
  }

  question = ''
  contexts = ['']
  answer = ''

  for t in traces:
    observations = [langfuse.client.observations.get(o) for o in t.observations]
    for o in observations:
        if o.name == 'RunnableSequence':
            if 'question' not in o.input or 'output' not in o.output:
              continue
            question = o.input['question']
            if 'contexts' in o.input:
              contexts = o.output['contexts']
            answer = o.output['output']
    evaluation_batch['question'].append(question)
    evaluation_batch['contexts'].append(contexts)
    evaluation_batch['answer'].append(answer)
    evaluation_batch['trace_id'].append(t.id)

  # print_json_dumps(evaluation_batch)

  from datasets import Dataset
  from ragas import evaluate

  ds = Dataset.from_dict(evaluation_batch)
  r = evaluate(ds, metrics=metrics)

if __name__ == "__main__":
  main()

import asyncio
import httpx
import time
import statistics
import argparse
import random
from typing import List

async def send_request(client: httpx.AsyncClient, url: str, headers: dict) -> float:
    """
    Sends a single request and returns the latency in milliseconds.
    Returns -1.0 on failure.
    """
    start_time = time.perf_counter()
    try:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        end_time = time.perf_counter()
        return (end_time - start_time) * 1000
    except Exception as e:
        # print(f"Request failed: {e}")
        return -1.0

async def worker(url: str, headers: dict, requests_to_send: int, latencies: List[float], semaphore: asyncio.Semaphore):
    """
    Worker task that sends a specified number of requests.
    """
    limits = httpx.Limits(max_keepalive_connections=None, max_connections=None)
    async with httpx.AsyncClient(limits=limits) as client:
        for _ in range(requests_to_send):
            async with semaphore:
                # Randomize train ID to avoid caching if any (though backend is dynamic)
                # train_id = f"T-{random.randint(100, 999)}"
                # full_url = f"{url}&train_id={train_id}"
                
                # sticking to fixed URL for now for consistency
                latency = await send_request(client, url, headers)
                if latency != -1.0:
                    latencies.append(latency)

async def run_benchmark(url: str, operator_id: str, total_requests: int, concurrency: int):
    print(f"🚀 Starting Benchmark: {total_requests} requests to {url}")
    print(f"👤  Operator: {operator_id} | 🔄 Concurrency: {concurrency}")
    
    latencies: List[float] = []
    semaphore = asyncio.Semaphore(concurrency)
    
    headers = {"operator_id": operator_id}
    
    requests_per_worker = total_requests // concurrency
    tasks = []
    
    start_time = time.perf_counter()
    
    for _ in range(concurrency):
        tasks.append(worker(url, headers, requests_per_worker, latencies, semaphore))
        
    await asyncio.gather(*tasks)
    
    total_time = time.perf_counter() - start_time
    
    if not latencies:
        print("❌ All requests failed.")
        return

    n = len(latencies)
    avg_latency = statistics.mean(latencies)
    p95 = statistics.quantiles(latencies, n=20)[18]
    p99 = statistics.quantiles(latencies, n=100)[98]
    rps = n / total_time
    
    print("\n📊 Benchmark Results:")
    print(f"==============================")
    print(f"✅ Successful Requests: {n}/{total_requests}")
    print(f"⏱️  Total Time:          {total_time:.2f}s")
    print(f"📈 Throughput:          {rps:.2f} RPS")
    print(f"🐢 Average Latency:     {avg_latency:.2f} ms")
    print(f"🐌 P95 Latency:         {p95:.2f} ms")
    print(f"🛑 P99 Latency:         {p99:.2f} ms")
    print(f"==============================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="RailBrain Performance Benchmark")
    parser.add_argument("--url", type=str, default="http://localhost:8000/benchmark_search?train_type=Freight_Heavy", help="Target endpoint")
    parser.add_argument("--operator", type=str, default="SNCFT", help="Operator ID header")
    parser.add_argument("--requests", type=int, default=1000, help="Total number of requests")
    parser.add_argument("--concurrency", type=int, default=50, help="Number of concurrent users")
    
    args = parser.parse_args()
    
    asyncio.run(run_benchmark(args.url, args.operator, args.requests, args.concurrency))

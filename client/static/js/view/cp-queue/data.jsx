const Data = {
	"results": [{
		"columns": ["p1", "p2"],
		"data": [{
			"graph": {
				"nodes": [{
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795444",
					"labels": ["CompanyName"],
					"properties": {
						"name": "水立方控股集团有限公司"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111811",
					"type": "AS_COMP_NAME",
					"startNode": "65795441",
					"endNode": "65795444",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "24165348",
					"labels": ["DistrictId"],
					"properties": {
						"name": "district_330000"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795444",
					"labels": ["CompanyName"],
					"properties": {
						"name": "水立方控股集团有限公司"
					}
				}],
				"relationships": [{
					"id": "98111837",
					"type": "LOCATED_IN",
					"startNode": "65795444",
					"endNode": "24165348",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111811",
					"type": "AS_COMP_NAME",
					"startNode": "65795441",
					"endNode": "65795444",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "24165348",
					"labels": ["DistrictId"],
					"properties": {
						"name": "district_330000"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111841",
					"type": "AS_COMP_DISTRICT",
					"startNode": "65795441",
					"endNode": "24165348",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795446",
					"labels": ["HomeAddress"],
					"properties": {
						"homeCity": "330000",
						"name": "浙江百果苑3-4号"
					}
				}],
				"relationships": [{
					"id": "98111838",
					"type": "AS_HOME_ADDRESS",
					"startNode": "65795441",
					"endNode": "65795446",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "24165348",
					"labels": ["DistrictId"],
					"properties": {
						"name": "district_330000"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795446",
					"labels": ["HomeAddress"],
					"properties": {
						"homeCity": "330000",
						"name": "浙江百果苑3-4号"
					}
				}],
				"relationships": [{
					"id": "98111839",
					"type": "LOCATED_IN",
					"startNode": "65795446",
					"endNode": "24165348",
					"properties": {}
				}, {
					"id": "98111838",
					"type": "AS_HOME_ADDRESS",
					"startNode": "65795441",
					"endNode": "65795446",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795443",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "057685219277"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111813",
					"type": "USE_AS_WORK",
					"startNode": "65795441",
					"endNode": "65795443",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795443",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "057685219277"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795445",
					"labels": ["CompanyAddr"],
					"properties": {
						"CompCity": "330000",
						"name": "浙江海虹大道809号"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111813",
					"type": "USE_AS_WORK",
					"startNode": "65795441",
					"endNode": "65795443",
					"properties": {}
				}, {
					"id": "98111815",
					"type": "AS_COMP_ADDRESS",
					"startNode": "65795443",
					"endNode": "65795445",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795443",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "057685219277"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795444",
					"labels": ["CompanyName"],
					"properties": {
						"name": "水立方控股集团有限公司"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111813",
					"type": "USE_AS_WORK",
					"startNode": "65795441",
					"endNode": "65795443",
					"properties": {}
				}, {
					"id": "98111812",
					"type": "AS_COMP_NAME",
					"startNode": "65795443",
					"endNode": "65795444",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795449",
					"labels": ["Phone"],
					"properties": {
						"name": "15057671139"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111843",
					"type": "USE_AS_REFERENCE",
					"startNode": "65795441",
					"endNode": "65795449",
					"properties": {
						"refOrder": "second_contact",
						"refName": "双",
						"refRelation": "others"
					}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795448",
					"labels": ["Phone"],
					"properties": {
						"name": "13058761827"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111842",
					"type": "USE_AS_REFERENCE",
					"startNode": "65795441",
					"endNode": "65795448",
					"properties": {
						"refOrder": "first_contact",
						"refName": "蒋春娥",
						"refRelation": "parent"
					}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "24165348",
					"labels": ["DistrictId"],
					"properties": {
						"name": "district_330000"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111840",
					"type": "AS_HOME_DISTRICT",
					"startNode": "65795441",
					"endNode": "24165348",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795445",
					"labels": ["CompanyAddr"],
					"properties": {
						"CompCity": "330000",
						"name": "浙江海虹大道809号"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111814",
					"type": "AS_COMP_ADDRESS",
					"startNode": "65795441",
					"endNode": "65795445",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "24165348",
					"labels": ["DistrictId"],
					"properties": {
						"name": "district_330000"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795445",
					"labels": ["CompanyAddr"],
					"properties": {
						"CompCity": "330000",
						"name": "浙江海虹大道809号"
					}
				}],
				"relationships": [{
					"id": "98111836",
					"type": "LOCATED_IN",
					"startNode": "65795445",
					"endNode": "24165348",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111814",
					"type": "AS_COMP_ADDRESS",
					"startNode": "65795441",
					"endNode": "65795445",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795447",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "13738631203"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "98111810",
					"type": "USE_AS_PRIMARY",
					"startNode": "65795441",
					"endNode": "65795447",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152835",
					"type": "HAS_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "48106043",
					"labels": ["CensusAddress"],
					"properties": {
						"name": "浙江省台州市临海市"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152835",
					"type": "HAS_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}, {
					"id": "101152833",
					"type": "AS_CENSUS_ADDRESS",
					"startNode": "68179235",
					"endNode": "48106043",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795447",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "13738631203"
					}
				}],
				"relationships": [{
					"id": "101152835",
					"type": "HAS_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}, {
					"id": "101152832",
					"type": "USE_AS_WORK",
					"startNode": "68179235",
					"endNode": "65795447",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "48106044",
					"labels": ["HomeAddress"],
					"properties": {
						"name": "浙江省台州市临海市"
					}
				}, {
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152835",
					"type": "HAS_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}, {
					"id": "101152834",
					"type": "AS_HOME_ADDRESS",
					"startNode": "68179235",
					"endNode": "48106044",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795447",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "13738631203"
					}
				}],
				"relationships": [{
					"id": "101152835",
					"type": "HAS_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152831",
					"type": "USE_AS_PRIMARY",
					"startNode": "68179235",
					"endNode": "65795447",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179232",
					"labels": ["IovationId"],
					"properties": {
						"name": "iovation_3637492"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152836",
					"type": "AS_FRAUD_MODEL",
					"startNode": "65795441",
					"endNode": "68179232",
					"properties": {
						"modelStage": "esign",
						"modelTime": "2020-04-26T07:38:20Z"
					}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179232",
					"labels": ["IovationId"],
					"properties": {
						"name": "iovation_3637492"
					}
				}, {
					"id": "68179233",
					"labels": ["Device"],
					"properties": {
						"name": "device_349597839387623299"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152836",
					"type": "AS_FRAUD_MODEL",
					"startNode": "65795441",
					"endNode": "68179232",
					"properties": {
						"modelStage": "esign",
						"modelTime": "2020-04-26T07:38:20Z"
					}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152828",
					"type": "RELATED_TO",
					"startNode": "68179232",
					"endNode": "68179233",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179232",
					"labels": ["IovationId"],
					"properties": {
						"name": "iovation_3637492"
					}
				}, {
					"id": "68179234",
					"labels": ["IP"],
					"properties": {
						"name": "39.181.230.231"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152836",
					"type": "AS_FRAUD_MODEL",
					"startNode": "65795441",
					"endNode": "68179232",
					"properties": {
						"modelStage": "esign",
						"modelTime": "2020-04-26T07:38:20Z"
					}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152829",
					"type": "RELATED_TO",
					"startNode": "68179232",
					"endNode": "68179234",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152830",
					"type": "USE_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "48106043",
					"labels": ["CensusAddress"],
					"properties": {
						"name": "浙江省台州市临海市"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152833",
					"type": "AS_CENSUS_ADDRESS",
					"startNode": "68179235",
					"endNode": "48106043",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152830",
					"type": "USE_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795447",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "13738631203"
					}
				}],
				"relationships": [{
					"id": "101152832",
					"type": "USE_AS_WORK",
					"startNode": "68179235",
					"endNode": "65795447",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152830",
					"type": "USE_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "48106044",
					"labels": ["HomeAddress"],
					"properties": {
						"name": "浙江省台州市临海市"
					}
				}, {
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101152834",
					"type": "AS_HOME_ADDRESS",
					"startNode": "68179235",
					"endNode": "48106044",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152830",
					"type": "USE_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68179235",
					"labels": ["PbocReport"],
					"properties": {
						"name": "pboc_131425"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795447",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "13738631203"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152831",
					"type": "USE_AS_PRIMARY",
					"startNode": "68179235",
					"endNode": "65795447",
					"properties": {}
				}, {
					"id": "101152830",
					"type": "USE_PBOC",
					"startNode": "65795441",
					"endNode": "68179235",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795442",
					"labels": ["NationalId","哈哈"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795447",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "13738631203"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152744",
					"type": "USE_AS_BANK",
					"startNode": "65795441",
					"endNode": "65795447",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order","emmmm"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "68179231",
					"labels": ["BankCard",'哈哈'],
					"properties": {
						"name": "6214835763276522"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152825",
					"type": "USE_BANKCARD",
					"startNode": "65795441",
					"endNode": "68179231",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}, {
					"id": "65795447",
					"labels": ["Phone", "CompPhone"],
					"properties": {
						"name": "13738631203"
					}
				}, {
					"id": "68179231",
					"labels": ["BankCard",'哈哈'],
					"properties": {
						"name": "6214835763276522"
					}
				}],
				"relationships": [{
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}, {
					"id": "101152826",
					"type": "USE_AS_BANK",
					"startNode": "68179231",
					"endNode": "65795447",
					"properties": {}
				}, {
					"id": "101152825",
					"type": "USE_BANKCARD",
					"startNode": "65795441",
					"endNode": "68179231",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68189048",
					"labels": ["Loan"],
					"properties": {
						"fundDate": "2020-05-12T00:00Z",
						"name": "2020ZJS214205505112353432A"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101165813",
					"type": "ISSUED",
					"startNode": "65795441",
					"endNode": "68189048",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}, {
			"graph": {
				"nodes": [{
					"id": "68189048",
					"labels": ["Loan"],
					"properties": {
						"fundDate": "2020-05-12T00:00Z",
						"name": "2020ZJS214205505112353432A"
					}
				}, {
					"id": "65795442",
					"labels": ["NationalId"],
					"properties": {
						"name": "331082199508041042",
						"customerId": "4314868",
						"custName": "张佳琴"
					}
				}, {
					"id": "68189049",
					"labels": ["LoanPerform"],
					"properties": {
						"inst2DfltDays": 0.0,
						"curDfltDays": 0.0,
						"maxDfltDays": 0,
						"inst1DfltDays": 0,
						"name": "2A_2020ZJS214205505112353432A",
						"updateTime": "2020-05-12T03:02:24.023Z",
						"inst3DfltDays": 0.0
					}
				}, {
					"id": "65795441",
					"labels": ["Order"],
					"properties": {
						"prodNo": "2A",
						"name": "2A202043148682A1588938413534",
						"custName": "张佳琴",
						"applyTime": "2020-05-11T23:54:27Z"
					}
				}],
				"relationships": [{
					"id": "101165813",
					"type": "ISSUED",
					"startNode": "65795441",
					"endNode": "68189048",
					"properties": {}
				}, {
					"id": "101165812",
					"type": "HAS_PERFORMANCE",
					"startNode": "68189048",
					"endNode": "68189049",
					"properties": {}
				}, {
					"id": "98111809",
					"type": "APPLY_ORDER",
					"startNode": "65795442",
					"endNode": "65795441",
					"properties": {}
				}]
			}
		}],
		"stats": {
			"contains_updates": false,
			"nodes_created": 0,
			"nodes_deleted": 0,
			"properties_set": 0,
			"relationships_created": 0,
			"relationship_deleted": 0,
			"labels_added": 0,
			"labels_removed": 0,
			"indexes_added": 0,
			"indexes_removed": 0,
			"constraints_added": 0,
			"constraints_removed": 0
		}
	}],
	"errors": []
}


var data2 = {
    "results": [
        {
            "columns": [
                "p"
            ],
            "data": [
                {
                    "row": [
                        [
                            {
                                "prodNo": "28A",
                                "name": "1906031338205726305",
                                "custName": "钟世清"
                            },
                            {},
                            {
                                "name": "350600198710183032"
                            },
                            {},
                            {
                                "prodNo": "2A",
                                "name": "2A202035199152A1577890678386",
                                "custName": "钟世清"
                            },
                            {},
                            {
                                "name": "福建漳州芗城浦南镇松州村洲尾35号"
                            }
                        ]
                    ],
                    "meta": [
                        [
                            {
                                "id": 26,
                                "type": "node",
                                "deleted": false
                            },
                            {
                                "id": 40,
                                "type": "relationship",
                                "deleted": false
                            },
                            {
                                "id": 42,
                                "type": "node",
                                "deleted": false
                            },
                            {
                                "id": 1,
                                "type": "relationship",
                                "deleted": false
                            },
                            {
                                "id": 60,
                                "type": "node",
                                "deleted": false
                            },
                            {
                                "id": 20,
                                "type": "relationship",
                                "deleted": false
                            },
                            {
                                "id": 40,
                                "type": "node",
                                "deleted": false
                            }
                        ]
                    ]
                },
                {
                    "row": [
                        [
                            {
                                "prodNo": "28A",
                                "name": "1906031338205726305",
                                "custName": "钟世清"
                            },
                            {},
                            {
                                "name": "350600198710183032"
                            },
                            {},
                            {
                                "prodNo": "2A",
                                "name": "2A202035199152A1577890678386",
                                "custName": "钟世清"
                            },
                            {},
                            {
                                "name": "13709386364"
                            }
                        ]
                    ],
                    "meta": [
                        [
                            {
                                "id": 26,
                                "type": "node",
                                "deleted": false
                            },
                            {
                                "id": 40,
                                "type": "relationship",
                                "deleted": false
                            },
                            {
                                "id": 42,
                                "type": "node",
                                "deleted": false
                            },
                            {
                                "id": 1,
                                "type": "relationship",
                                "deleted": false
                            },
                            {
                                "id": 60,
                                "type": "node",
                                "deleted": false
                            },
                            {
                                "id": 22,
                                "type": "relationship",
                                "deleted": false
                            },
                            {
                                "id": 43,
                                "type": "node",
                                "deleted": false
                            }
                        ]
                    ]
                }
            ]
        }
    ],
    "errors": []
}

export default Data
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Traceability {
    struct TraceRecord {
        string batchId;
        string actorRole;
        string dataHash;
        uint256 timestamp;
    }

    mapping(string => TraceRecord[]) public traces; // batchId => list of events

    event TraceAdded(string batchId, string actorRole, string dataHash, uint256 timestamp);

    function addTrace(string memory batchId, string memory actorRole, string memory dataHash) public {
        TraceRecord memory tr = TraceRecord(batchId, actorRole, dataHash, block.timestamp);
        traces[batchId].push(tr);
        emit TraceAdded(batchId, actorRole, dataHash, block.timestamp);
    }

    function getTraceCount(string memory batchId) public view returns (uint256) {
        return traces[batchId].length;
    }

    function getTrace(string memory batchId, uint256 index) public view returns (string memory, string memory, string memory, uint256) {
        TraceRecord memory tr = traces[batchId][index];
        return (tr.batchId, tr.actorRole, tr.dataHash, tr.timestamp);
    }
}
/*
* This file is part of symfinder.
*
* symfinder is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* symfinder is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with symfinder. If not, see <http://www.gnu.org/licenses/>.
*
* Copyright 2018-2019 Johann Mortara <johann.mortara@univ-cotedazur.fr>
* Copyright 2018-2019 Xhevahire Tërnava <xhevahire.ternava@lip6.fr>
* Copyright 2018-2019 Philippe Collet <philippe.collet@univ-cotedazur.fr>
*/

describe("Checking instantiation link when composing using fields", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/usage_levels_inheritance.json", "tests/data/usage_levels_inheritance-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be 3 USE links', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE").length).toBe(3);
    });

    it('there should be an USE link between RootClass and Composed1', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE" && l.source === "RootClass" && l.target === "Composed1").length).toBe(1);
    });

    it('there should be an USE link between Composed1 and Composed2', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE" && l.source === "Composed1" && l.target === "Composed2").length).toBe(1);
    });

    it('there should be an USE link between Composed1 and Composed3', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE" && l.source === "Composed1" && l.target === "Composed3").length).toBe(1);
    });

});

describe("Checking instantiation link when composing using method parameters", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/usage_levels_mixed.json", "tests/data/usage_levels_mixed-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be 3 USE links', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE").length).toBe(3);
    });

    it('there should be an USE link between RootClass and Composed1', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE" && l.source === "RootClass" && l.target === "Composed1").length).toBe(1);
    });

    it('there should be an USE link between Composed1 and Composed2', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE" && l.source === "Composed1" && l.target === "Composed2").length).toBe(1);
    });

    it('there should be an USE link between Composed1 and Composed3', () => {
        expect(jsonData.alllinks.filter(l => l.type === "USE" && l.source === "Composed1" && l.target === "Composed3").length).toBe(1);
    });

});

describe("Tests on attribute_usage using generic types", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/attribute_usage_generic.json", "tests/data/attribute_usage_generic-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('A should compose B', () => {
        expect(jsonData.alllinks.filter(l => l.source === "A" && l.target === "B").length).toBe(1);
    });
    it('A should only compose B', () => {
        expect(jsonData.alllinks.filter(l => l.source === "A").length).toBe(1);
    });
    it('B should not compose anyone', () => {
        expect(jsonData.alllinks.filter(l => l.source === "B").length).toBe(0);
    });
    it('D should compose A, B and C', () => {
        expect(jsonData.alllinks.filter(l => l.source === "D" && l.target === "A").length).toBe(1);
        expect(jsonData.alllinks.filter(l => l.source === "D" && l.target === "B").length).toBe(1);
        expect(jsonData.alllinks.filter(l => l.source === "D" && l.target === "C").length).toBe(1);
    });

    afterAll(() => sessionStorage.clear())

});


function getJsonData(file, statsFile) {
    return new Promise(((resolve, reject) => {
        d3.queue()
            .defer(d3.json, file)
            .defer(d3.json, statsFile)
            .await(function (err, data, statsData) {
                resolve([data, statsData]);
            });
    }));
}

function getNodeWithName(jsonData, name) {
    return jsonData.nodes.filter(n => n.name === name)[0];
}
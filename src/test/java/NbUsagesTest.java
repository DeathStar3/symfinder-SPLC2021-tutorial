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

import neo4j_types.EntityAttribute;
import neo4j_types.EntityType;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class NbUsagesTest extends Neo4jTest {

    private final String propertyName = "nbUsages";

    @Test
    public void NoUsages() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityAttribute.ABSTRACT);
            graph.setNbUsages();
            assertEquals(0L, graph.getPropertyValue(shapeClass, propertyName));
        });
    }

    @Test
    public void OneUsage() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityAttribute.ABSTRACT);
            Node circleClass = graph.createNode("Circle", EntityType.CLASS);
            graph.linkTwoNodes(shapeClass, circleClass, RelationType.USE);
            graph.setNbUsages();
            assertEquals(1L, graph.getPropertyValue(shapeClass, propertyName));
        });
    }

    @Test
    public void ThreeUsages() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityAttribute.ABSTRACT);
            Node circleClass = graph.createNode("Circle", EntityType.CLASS);
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            Node triangleClass = graph.createNode("Triangle", EntityType.CLASS);
            graph.linkTwoNodes(shapeClass, circleClass, RelationType.USE);
            graph.linkTwoNodes(shapeClass, rectangleClass, RelationType.USE);
            graph.linkTwoNodes(shapeClass, triangleClass, RelationType.USE);
            graph.setNbUsages();
            assertEquals(3L, graph.getPropertyValue(shapeClass, propertyName));
        });
    }

    @Test
    public void MultipleClassesTwoUsages() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS);
            Node polygonClass = graph.createNode("Polygon", EntityType.CLASS);
            Node circleClass = graph.createNode("Circle", EntityType.CLASS);
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS);
            graph.linkTwoNodes(shapeClass, polygonClass, RelationType.EXTENDS);
            graph.linkTwoNodes(shapeClass, circleClass, RelationType.USE);
            graph.linkTwoNodes(polygonClass, rectangleClass, RelationType.USE);
            graph.setNbUsages();
            assertEquals(1L, graph.getPropertyValue(shapeClass, propertyName));
            assertEquals(1L, graph.getPropertyValue(polygonClass, propertyName));
            assertEquals(0L, graph.getPropertyValue(circleClass, propertyName));
            assertEquals(0L, graph.getPropertyValue(rectangleClass, propertyName));
        });
    }

}

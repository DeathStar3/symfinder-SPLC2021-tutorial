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

import neo4j_types.EntityType;
import neo4j_types.EntityVisibility;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.Assert.assertEquals;

public class AllMethodsTest extends Neo4jTest {

    @Test
    public void OnePrivateMethod() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PRIVATE);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.setAllMethods();
            assertEquals(1, graph.getNbAllMethods() );
        });
    }

    @Test
    public void OnePublicMethodInANotPublicClass() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.setAllMethods();
            assertEquals(1, graph.getNbAllMethods());
        });
    }

    @Test
    public void OnePublicMethodInAPublicClass() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.setAllMethods();
            assertEquals(1, graph.getNbAllMethods());
        });
    }

    @Test
    public void OneMethodOneConstructor() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node shapeConstructor = graph.createNode("Shape", EntityType.CONSTRUCTOR);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, shapeConstructor, relationType);
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.setAllMethods();
            assertEquals(1, graph.getNbAllMethods());
        });
    }

    @Test
    public void TwoMethods() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node displayMethod = graph.createNode("display1", EntityType.METHOD, EntityVisibility.PUBLIC);
            Node displayMethod2 = graph.createNode("display2", EntityType.METHOD, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.linkTwoNodes(shapeClass, displayMethod2, relationType);
            graph.setAllMethods();
            assertEquals(2, graph.getNbAllMethods());
        });
    }

    @Test
    public void TwoMethodsWithSameName() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            Node displayMethod2 = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.linkTwoNodes(shapeClass, displayMethod2, relationType);
            graph.setAllMethods();
            assertEquals(2, graph.getNbAllMethods());
        });
    }

    @Test
    public void TwoMethodsWithSameNameButOneIsPrivate() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            Node displayMethod2 = graph.createNode("display", EntityType.METHOD, EntityVisibility.PRIVATE);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.linkTwoNodes(shapeClass, displayMethod2, relationType);
            graph.setAllMethods();
            assertEquals(2, graph.getNbAllMethods());
        });
    }

    @Test
    public void TwoClassesWithMethods() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            Node displayMethod2 = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.linkTwoNodes(rectangleClass, displayMethod2, relationType);
            graph.setAllMethods();
            assertEquals(2, graph.getNbAllMethods());
        });
    }

    @Test
    public void TwoClassesWithPublicAndPrivateMethods() {
        runTest(graph -> {
            Node shapeClass = graph.createNode("Shape", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node rectangleClass = graph.createNode("Rectangle", EntityType.CLASS, EntityVisibility.PUBLIC);
            Node displayMethod = graph.createNode("display", EntityType.METHOD, EntityVisibility.PUBLIC);
            Node displayMethod2 = graph.createNode("display", EntityType.METHOD, EntityVisibility.PRIVATE);
            RelationType relationType = RelationType.METHOD;
            graph.linkTwoNodes(shapeClass, displayMethod, relationType);
            graph.linkTwoNodes(rectangleClass, displayMethod2, relationType);
            graph.setAllMethods();
            assertEquals(2, graph.getNbAllMethods());
        });
    }

}